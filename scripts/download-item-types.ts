import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

function toTypename(apiKey: string): string {
  const pascalCase = apiKey
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  return `${pascalCase}Record`;
}

async function downloadItemTypes() {
  const token = process.env.DATOCMS_API_TOKEN?.trim();
  const filePath = './src/lib/datocms/itemTypes.json';
  
  if (!token) {
    if (process.env.CI) {
      console.log(
        'DATOCMS_API_TOKEN is missing; creating empty itemTypes.json for CI.',
      );
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify({}, null, 2));
      return;
    }
    throw new Error(
      'DATOCMS_API_TOKEN is required. Set it and rerun `npm run prep:download-item-types`.',
    );
  }

  const client = buildClient({
    apiToken: token,
    environment: datocmsEnvironment,
  });

  const itemTypes = await client.itemTypes.list();
  const typenameMap: Record<string, string> = {};

  for (const itemType of itemTypes) {
    const apiKey = itemType.api_key;
    if (!apiKey || !itemType.id) continue;

    const typename = toTypename(apiKey);
    typenameMap[typename] = itemType.id;
  }

  const sortedEntries = Object.entries(typenameMap)
    .sort(([a], [b]) => a.localeCompare(b));

  const jsonContent = Object.fromEntries(sortedEntries);

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(jsonContent, null, 2));

  console.log('Item types downloaded');
}

downloadItemTypes()
  .catch((error) => {
    console.error('Failed to download item types:', error);
    process.exit(1);
  });

