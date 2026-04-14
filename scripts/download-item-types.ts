import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pascalCase } from 'scule';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({ allowEmptyValues: Boolean(process.env.CI) });

const filePath = './src/lib/datocms/itemTypes.json';

type ItemTypeInfo = {
  id: string;
  apiKey: string;
  name: string;
};

function convertApiKeyToTypename(apiKey: string): string {
  return `${pascalCase(apiKey)}Record`;
}

async function ensureDirAndWriteJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2));
}

function sortObjectKeys<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))) as T;
}

async function downloadItemTypes() {
  const token = process.env.DATOCMS_API_TOKEN?.trim();

  if (!token) {
    console.log('DATOCMS_API_TOKEN is missing; creating empty itemTypes.json.');
    await ensureDirAndWriteJson(filePath, { itemTypes: {} });
    return;
  }

  const client = buildClient({ apiToken: token, environment: datocmsEnvironment });

  const itemTypes: ItemTypeInfo[] = (await client.itemTypes.list())
    .filter((itemType) => Boolean(itemType.api_key && itemType.id))
    .map((itemType) => ({
      id: itemType.id as string,
      apiKey: itemType.api_key as string,
      name: (itemType.name as string) ?? '',
    }));

  const itemTypesMap: Record<string, { id: string; name: string }> = {};
  for (const { id, apiKey, name } of itemTypes) {
    const typename = convertApiKeyToTypename(apiKey);
    itemTypesMap[typename] = {
      id,
      name: name || typename.replace(/Record$/, ''),
    };
  }

  const jsonContent = { itemTypes: sortObjectKeys(itemTypesMap) };

  await ensureDirAndWriteJson(filePath, jsonContent);
  console.log('Item types downloaded');
}

downloadItemTypes().catch((error) => {
  console.error('Failed to download item types:', error);
  process.exit(1);
});
