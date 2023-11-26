import { writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config();

/**
 * Recursively rename keys in an object from snake_case to camelCase.
 * Credits: https://stackoverflow.com/a/58257506
 */
function renameKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const modifiedKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
    const modifiedVal = typeof val === 'object' && val !== null ? 
      renameKeys(val as Record<string, unknown>) : val;
    return {
      ...acc,
      [modifiedKey]: modifiedVal,
    };
  }, {});
}

async function downloadSiteData() {
  const client = buildClient({
    apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
    environment: datocmsEnvironment,
  });
  const site = await client.site.find();
  await writeFile('./src/lib/site.json', JSON.stringify(renameKeys(site), null, 2));
}

downloadSiteData()
  .then(() => console.log('DatoCMS Site data downloaded'));
