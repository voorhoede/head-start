import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pascalCase } from 'scule';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({ allowEmptyValues: Boolean(process.env.CI) });

const blocksDir = './src/blocks';
const itemTypesPath = './src/lib/datocms/itemTypes.json';
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const force = process.argv.includes('--force');

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

    if (!textPath) warnings.push(`${blockName}: missing ${blockName}.preview.txt`);
    if (!imagePath) warnings.push(`${blockName}: missing ${blockName}.preview image`);

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

  console.log(`Found ${previews.length} block(s) with preview files.${force ? ' (--force)' : ''}`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const { blockName, itemTypeId, textPath, imagePath } of previews) {
    const current = await client.itemTypes.find(itemTypeId);
    const updates: Record<string, unknown> = {};

    if (textPath) {
      if (force || !current.hint) {
        const textContent = await readFile(textPath, 'utf-8');
        updates.hint = textContent.trim();
      }
    }

    if (imagePath) {
      if (force || !current.image_preview_field) {
        const upload = await client.uploads.createFromLocalFile({
          localPath: imagePath,
          filename: `${blockName.toLowerCase()}-preview${extname(imagePath)}`,
          onProgress: () => {},
        });
        updates.image_preview_field = { id: upload.id, type: 'upload' };
      }
    }

    if (Object.keys(updates).length === 0) {
      skippedCount++;
      continue;
    }

    await client.itemTypes.update(itemTypeId, updates as Parameters<typeof client.itemTypes.update>[1]);
    console.log(`${blockName}: updated`);
    updatedCount++;
  }

  console.log(`Block previews uploaded: ${updatedCount} updated, ${skippedCount} skipped`);
}

uploadBlockPreviews().catch((error) => {
  console.error('Failed to upload block previews:', error);
  process.exit(1);
});
