import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({ allowEmptyValues: Boolean(process.env.CI) });

const FILE_PATH = './src/lib/datocms/itemTypes.json';
const CONCURRENT_REQUESTS_LIMIT = 6;

const FOCUS_FIELD_OVERRIDES: Record<string, string> = {
  page_partial_block: 'items',
};

const METADATA_FIELDS = new Set(['title', 'layout', 'style', 'slug', 'id', '_modelApiKey']);

type DatoField = {
  field_type: string;
  api_key: string;
  validators?: unknown;
};

function convertApiKeyToTypename(apiKey: string): string {
  const words = apiKey.split(/[_-]/);
  const pascalCase = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  return `${pascalCase}Record`;
}

function hasLinkedItemTypes(field: DatoField): boolean {
  if (field.field_type !== 'link') return false;
  const validators = field.validators as { itemItemType?: { itemTypes?: unknown[] } } | undefined;
  return Boolean(validators?.itemItemType?.itemTypes?.length);
}

function pickFocusField(fields: DatoField[]): DatoField | null {
  const contentFields = fields.filter((field) => !METADATA_FIELDS.has(field.api_key));

  const fieldTypeMatchers: Array<(field: DatoField) => boolean> = [
    (field) => field.field_type === 'rich_text' || field.field_type === 'structured_text',
    (field) => field.field_type === 'file' || field.field_type === 'video',
    (field) => field.field_type === 'json',
    (field) => field.field_type === 'text' && field.api_key === 'url',
    (field) => hasLinkedItemTypes(field),
  ];

  for (const matcher of fieldTypeMatchers) {
    const matchingField = contentFields.find(matcher);
    if (matchingField) return matchingField;
  }

  return null;
}

async function ensureDirAndWriteJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2));
}

function sortObjectKeys<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))) as T;
}

// Run async work with a small concurrency cap to avoid spiking the api
async function processItemsConcurrently<T>(
  items: T[],
  concurrencyLimit: number,
  processItem: (item: T, index: number) => Promise<void>
): Promise<void> {
  let currentIndex = 0;

  const workers = Array.from(
    { length: Math.min(concurrencyLimit, items.length) },
    async () => {
      while (true) {
        const i = currentIndex++;
        if (i >= items.length) return;
        await processItem(items[i], i);
      }
    }
  );

  await Promise.all(workers);
}

async function downloadItemTypes() {
  const token = process.env.DATOCMS_API_TOKEN?.trim();

  if (!token) {
    console.log('DATOCMS_API_TOKEN is missing; creating empty itemTypes.json.');
    await ensureDirAndWriteJson(FILE_PATH, { itemTypes: {} });
    return;
  }

  const client = buildClient({ apiToken: token, environment: datocmsEnvironment });

  const itemTypes = (await client.itemTypes.list())
    .filter((itemType) => Boolean(itemType.api_key && itemType.id))
    .map((itemType) => ({
      id: itemType.id as string,
      apiKey: itemType.api_key as string,
      name: (itemType.name as string) ?? '',
    }));

  const blockFieldsMap: Record<string, string> = {};

  await processItemsConcurrently(itemTypes, CONCURRENT_REQUESTS_LIMIT, async ({ id, apiKey }) => {
    const manualOverride = FOCUS_FIELD_OVERRIDES[apiKey];
    if (manualOverride) {
      blockFieldsMap[apiKey] = manualOverride;
      return;
    }

    const fields = (await client.fields.list(id)) as DatoField[];
    const focusField = pickFocusField(fields);
    if (focusField?.api_key) {
      blockFieldsMap[apiKey] = focusField.api_key;
    }
  });

  const itemTypesMap: Record<string, { id: string; name: string; focusField?: string }> = {};
  for (const { id, apiKey, name } of itemTypes) {
    const typename = convertApiKeyToTypename(apiKey);
    itemTypesMap[typename] = {
      id,
      name: name || typename.replace(/Record$/, ''),
      ...(blockFieldsMap[apiKey] && { focusField: blockFieldsMap[apiKey] }),
    };
  }

  const jsonContent = { itemTypes: sortObjectKeys(itemTypesMap) };

  await ensureDirAndWriteJson(FILE_PATH, jsonContent);
  console.log('Item types downloaded');
}

downloadItemTypes().catch((error) => {
  console.error('Failed to download item types:', error);
  process.exit(1);
});
