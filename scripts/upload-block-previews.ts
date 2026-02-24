import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pascalCase } from 'scule';
import { confirm } from '@inquirer/prompts';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({ allowEmptyValues: Boolean(process.env.CI) });

const blocksDir = './src/blocks';
const itemTypesPath = './src/lib/datocms/itemTypes.json';
const hashesPath = './src/lib/datocms/previewHashes.json';
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const uploadCollectionName = 'Block Previews';

type PreviewHashes = Record<string, { text?: string; image?: string; imageUrl?: string }>;

async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('md5').update(content).digest('hex');
}

async function loadHashes(): Promise<PreviewHashes> {
  try {
    const raw = await readFile(hashesPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveHashes(hashes: PreviewHashes): Promise<void> {
  await writeFile(hashesPath, JSON.stringify(hashes, null, 2) + '\n');
}

type ItemTypeEntry = {
  id: string;
  name: string;
  focusField?: string;
};

type ItemTypesJson = {
  itemTypes: Record<string, ItemTypeEntry>;
};

type BlockPreview = {
  blockName: string;
  itemTypeId: string;
  textPath?: string;
  imagePath?: string;
};

function getItemTypeId(blockName: string, itemTypes: ItemTypesJson['itemTypes']): string | null {
  const key = `${pascalCase(blockName)}Record`;
  return itemTypes[key]?.id ?? null;
}

async function discoverBlockPreviews(itemTypes: ItemTypesJson['itemTypes']): Promise<BlockPreview[]> {
  const entries = await readdir(blocksDir, { withFileTypes: true });
  const blockDirs = entries.filter((e) => e.isDirectory());

  const previews: BlockPreview[] = [];
  const warnings: string[] = [];

  for (const dir of blockDirs) {
    const blockName = dir.name;
    const blockDir = join(blocksDir, blockName);

    const itemTypeId = getItemTypeId(blockName, itemTypes);
    if (!itemTypeId) continue;

    const files = await readdir(blockDir);

    const textFile = files.find((f) => f === `${blockName}.preview.txt`);
    const textPath = textFile ? join(blockDir, textFile) : undefined;

    const imageFile = files.find((f) =>
      imageExtensions.some((ext) => f === `${blockName}.preview${ext}`)
    );
    const imagePath = imageFile ? join(blockDir, imageFile) : undefined;

    if (!textPath) warnings.push(`${blockName}: add src/blocks/${blockName}/${blockName}.preview.txt`);
    if (!imagePath) warnings.push(`${blockName}: add src/blocks/${blockName}/${blockName}.preview.{jpg,png,webp}`);

    if (!textPath && !imagePath) continue;

    previews.push({ blockName, itemTypeId, textPath, imagePath });
  }

  if (warnings.length > 0) {
    console.log('Missing preview files (both text and image are recommended):');
    warnings.forEach((w) => console.warn(w));
    console.log('');
  }

  return previews;
}

async function findOrCreateCollection(client: ReturnType<typeof buildClient>): Promise<string> {
  const collections = await client.uploadCollections.list();
  const existing = collections.find((c) => c.label === uploadCollectionName);
  if (existing) return existing.id;

  const created = await client.uploadCollections.create({ label: uploadCollectionName });
  console.log(`Created upload collection "${uploadCollectionName}"`);
  return created.id;
}

async function uploadBlockPreviews() {
  const token = process.env.DATOCMS_API_TOKEN?.trim();
  if (!token) {
    console.log('DATOCMS_API_TOKEN is missing; skipping block preview upload.');
    return;
  }

  const client = buildClient({ apiToken: token, environment: datocmsEnvironment });

  const itemTypesRaw = await readFile(itemTypesPath, 'utf-8');
  const { itemTypes } = JSON.parse(itemTypesRaw) as ItemTypesJson;

  const previews = await discoverBlockPreviews(itemTypes);

  if (previews.length === 0) {
    console.log('No block previews found.');
    return;
  }

  console.log(`Found ${previews.length} block(s) with preview files.`);

  const hashes = await loadHashes();
  const changedPreviews = [];

  for (const preview of previews) {
    const { blockName, textPath, imagePath } = preview;
    const textHash = textPath ? await hashFile(textPath) : undefined;
    const imageHash = imagePath ? await hashFile(imagePath) : undefined;
    const prev = hashes[blockName];

    if (prev && prev.text === textHash && prev.image === imageHash) continue;

    changedPreviews.push(preview);
  }

  if (changedPreviews.length === 0) {
    console.log('All block previews are up to date.');
    return;
  }

  console.log(`${changedPreviews.length} block(s) to upload: ${changedPreviews.map((p) => p.blockName).join(', ')}`);

  if (!process.env.CI) {
    const confirmed = await confirm({
      message: 'Upload block previews to DatoCMS?',
      default: true,
    });
    if (!confirmed) {
      console.log('Cancelled.');
      return;
    }
  }

  const hasAnyImage = changedPreviews.some((p) => p.imagePath);
  const collectionId = hasAnyImage ? await findOrCreateCollection(client) : null;

  let updatedCount = 0;

  for (const { blockName, itemTypeId, textPath, imagePath } of changedPreviews) {
    const prev = hashes[blockName];
    const imageHash = imagePath ? await hashFile(imagePath) : undefined;

    // Build the hint: image URL on the first line (if available), then the text description.
    // DatoCMS renders an image preview when the hint starts with an image URL.
    let hint = '';
    let imageUrl = prev?.imageUrl;

    // Only upload the image if it changed or hasn't been uploaded yet.
    if (imagePath) {
      const imageChanged = imageHash !== prev?.image;

      if (imageChanged || !imageUrl) {
        const upload = await client.uploads.createFromLocalFile({
          localPath: imagePath,
          filename: `${blockName}.preview${extname(imagePath)}`,
          ...(collectionId && { upload_collection: { id: collectionId, type: 'upload_collection' } }),
          onProgress: () => {},
        });
        imageUrl = upload.url;
      }

      hint += imageUrl;
    }

    if (textPath) {
      const textContent = await readFile(textPath, 'utf-8');
      const trimmed = textContent.trim();
      if (trimmed) {
        hint += hint ? `\n${trimmed}` : trimmed;
      }
    }

    if (!hint) continue;

    await client.itemTypes.update(itemTypeId, { hint } as Parameters<typeof client.itemTypes.update>[1]);

    // Store hashes and image URL after successful upload.
    hashes[blockName] = {
      text: textPath ? await hashFile(textPath) : undefined,
      image: imageHash,
      imageUrl,
    };

    console.log(`${blockName}: updated`);
    updatedCount++;
  }

  await saveHashes(hashes);
  console.log(`Done. ${updatedCount} block preview(s) uploaded.`);
}

uploadBlockPreviews().catch((error) => {
  console.error('Failed to upload block previews:', error);
  process.exit(1);
});
