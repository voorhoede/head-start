import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

type ItemTypeIdMap = {
  [modelApiKey: string]: string;
};

/**
 * Downloads item type IDs from DatoCMS Management API.
 * Maps model API keys (e.g., 'page', 'home_page') to their item type IDs.
 * These IDs are used to construct editor URLs in preview mode.
 */
async function getItemTypeIds() {
  const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN!,
    environment: datocmsEnvironment,
  });

  const itemTypeIdMap: ItemTypeIdMap = {};
  
  const itemTypes = await client.itemTypes.list();
  
  for (const itemType of itemTypes) {
    if (itemType.api_key && itemType.id) {
      itemTypeIdMap[itemType.api_key] = itemType.id;
    }
  }
  
  return itemTypeIdMap;
}

async function downloadItemTypeIds() {
  const itemTypeIds = await getItemTypeIds();
  
  const itemTypeIdsPath = './src/lib/item-type-ids.json';
  await mkdir(dirname(itemTypeIdsPath), { recursive: true });
  await writeFile(
    itemTypeIdsPath,
    JSON.stringify(itemTypeIds, null, 2)
  );
}

downloadItemTypeIds()
  .then(() => console.log('Item type IDs downloaded'))
  .catch((error) => {
    console.error('Failed to download item type IDs:', error);
    process.exit(1);
  });