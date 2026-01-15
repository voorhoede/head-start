// Build a DatoCMS editor URL for a record (used in preview / editor links).

import itemTypeIdsJson from '@lib/item-type-ids.json';
import { datocmsEnvironment } from '@root/datocms-environment';
import { DATOCMS_READONLY_API_TOKEN } from 'astro:env/server';
import type { DatoCmsRecordIdentity } from '@lib/datocms/recordIdentity';
import { buildEditorUrlFromToken } from './buildEditorUrl';
import { getModelApiKey } from './modelApiKeys';

const itemTypeIds = itemTypeIdsJson as Record<string, string>;

// Note: ensure your GraphQL query includes `id` and `__typename`
export function getEditorUrlFromRecord(
  record: DatoCmsRecordIdentity | null | undefined,
  apiToken?: string,
  environment?: string,
): string | null {
  const id = record?.id;
  if (!id) return null;

  const modelApiKey = getModelApiKey(record?.__typename);
  const itemTypeId = modelApiKey ? itemTypeIds[modelApiKey] ?? null : null;

  const token = apiToken ?? DATOCMS_READONLY_API_TOKEN;
  const env = environment ?? datocmsEnvironment;

  return buildEditorUrlFromToken(id, itemTypeId, token, env);
}

