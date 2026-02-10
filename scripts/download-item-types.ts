import { buildClient } from '@datocms/cma-client-node';
import { mapLimit } from 'async';
import dotenv from 'dotenv-safe';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pascalCase } from 'scule';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({ allowEmptyValues: Boolean(process.env.CI) });

const filePath = './src/lib/datocms/itemTypes.json';
const concurrentRequestsLimit = 6;

const focusFieldOverrides: Record<string, string> = {
  page_partial_block: 'items',
};

const metadataFields = new Set(['title', 'layout', 'style', 'slug', 'id', '_modelApiKey']);

type DatoField = {
  field_type: string;
  api_key: string;
  validators?: unknown;
};

type ItemTypeInfo = {
  id: string;
  apiKey: string;
  name: string;
};

function convertApiKeyToTypename(apiKey: string): string {
  return `${pascalCase(apiKey)}Record`;
}

function hasLinkedItemTypes(field: DatoField): boolean {
  if (field.field_type !== 'link') return false;
  const validators = field.validators as { itemItemType?: { itemTypes?: unknown[] } } | undefined;
  return Boolean(validators?.itemItemType?.itemTypes?.length);
}

function pickFocusField(fields: DatoField[]): DatoField | null {
  const contentFields = fields.filter((field) => !metadataFields.has(field.api_key));

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

  const blockFieldsMap: Record<string, string> = {};

  await mapLimit(itemTypes, concurrentRequestsLimit, async (itemType: ItemTypeInfo) => {
    const { id, apiKey } = itemType;
    const manualOverride = focusFieldOverrides[apiKey];
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

  await ensureDirAndWriteJson(filePath, jsonContent);
  console.log('Item types downloaded');
}

downloadItemTypes().catch((error) => {
  console.error('Failed to download item types:', error);
  process.exit(1);
});
