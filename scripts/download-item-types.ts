import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

type ItemTypesMap = {
  [modelApiKey: string]: { id: string };
};

/**
 * Downloads DatoCMS item type metadata from the Management API.
 *
 * Output: `src/lib/datocms/itemTypes.json`
 * - key: model API key (e.g. `text_block`)
 * - value: `{ id }`
 */
async function getItemTypesMetadata() {
  const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN!,
    environment: datocmsEnvironment,
  });

  const itemTypesMap: ItemTypesMap = {};

  const itemTypes = await client.itemTypes.list();

  for (const itemType of itemTypes) {
    const apiKey = itemType.api_key;
    if (!apiKey) continue;
    if (!itemType.id) continue;

    itemTypesMap[apiKey] = { id: itemType.id };
  }

  return itemTypesMap;
}

async function downloadItemTypes() {
  const token = process.env.DATOCMS_API_TOKEN?.trim();
  if (!token) {
    if (process.env.CI) {
      console.log(
        'DATOCMS_API_TOKEN is missing; skipping item type download.',
      );
      return;
    }
    throw new Error(
      'DATOCMS_API_TOKEN is required to download item types. Set it and rerun `npm run prep:download-item-types`.',
    );
  }

  process.env.DATOCMS_API_TOKEN = token;
  const itemTypes = await getItemTypesMetadata();

  const itemTypesPath = './src/lib/datocms/itemTypes.json';
  await mkdir(dirname(itemTypesPath), { recursive: true });
  await writeFile(itemTypesPath, JSON.stringify(itemTypes, null, 2));

  console.log('Item types downloaded');
}

downloadItemTypes()
  .catch((error) => {
    console.error('Failed to download item types:', error);
    process.exit(1);
  });

