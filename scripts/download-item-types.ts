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
 * Output: `src/lib/datocms/item-types.json`
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
  const itemTypes = await getItemTypesMetadata();

  const itemTypesPath = './src/lib/datocms/item-types.json';
  await mkdir(dirname(itemTypesPath), { recursive: true });
  await writeFile(itemTypesPath, JSON.stringify(itemTypes, null, 2));
}

downloadItemTypes()
  .then(() => console.log('Item types downloaded'))
  .catch((error) => {
    console.error('Failed to download item types:', error);
    process.exit(1);
  });

