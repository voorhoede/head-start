import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

// Override focus field detection if auto-detection picks the wrong field.
// Useful when a block has multiple content fields and you want a specific one.
// Format: block API key -> field API key
const FOCUS_FIELD_OVERRIDES: Record<string, string> = {
  'card_block': 'item',
};

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
  const typenameMap: Record<string, string | { id: string; focusField: string }> = {};
  const blockFieldsMap: Record<string, string> = {};

  // Finds the field to focus when editing a block in preview mode.
  function findFocusField(fields: Array<{ field_type: string; api_key: string; validators?: unknown }>) {
    const metadataFields = new Set(['title', 'layout', 'style', 'slug', 'id', '_modelApiKey']);
    
    return fields.find((field) => {
      if (metadataFields.has(field.api_key)) {
        return false;
      }
      
      const fieldType = field.field_type;
      
      if (fieldType === 'rich_text' || fieldType === 'structured_text') {
        return true;
      }
      if (fieldType === 'file' || fieldType === 'video') {
        return true;
      }
      if (fieldType === 'json') {
        return true;
      }
      if (fieldType === 'text' && field.api_key === 'url') {
        return true;
      }
      if (fieldType === 'link') {
        const validators = field.validators as { itemItemType?: { itemTypes?: unknown[] } } | undefined;
        if (validators?.itemItemType?.itemTypes?.length) {
          return true;
        }
      }
      return false;
    });
  }

  for (const itemType of itemTypes) {
    const apiKey = itemType.api_key;
    if (!apiKey || !itemType.id) continue;

    const typename = toTypename(apiKey);
    typenameMap[typename] = itemType.id;
    
    if (FOCUS_FIELD_OVERRIDES[apiKey]) {
      blockFieldsMap[apiKey] = FOCUS_FIELD_OVERRIDES[apiKey];
      continue;
    }
    
    const fields = await client.fields.list(itemType.id);
    const focusField = findFocusField(fields);

    if (focusField?.api_key) {
      blockFieldsMap[apiKey] = focusField.api_key;
    }
  }

  const sortedTypenameEntries = Object.entries(typenameMap)
    .sort(([a], [b]) => a.localeCompare(b));
  const typenameContent = Object.fromEntries(sortedTypenameEntries);

  const sortedBlockFieldsEntries = Object.entries(blockFieldsMap)
    .sort(([a], [b]) => a.localeCompare(b));
  const blockFieldsContent = Object.fromEntries(sortedBlockFieldsEntries);

  const jsonContent = {
    ...typenameContent,
    _blockFields: blockFieldsContent,
  };

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(jsonContent, null, 2));

  console.log('Item types downloaded');
}

downloadItemTypes()
  .catch((error) => {
    console.error('Failed to download item types:', error);
    process.exit(1);
  });

