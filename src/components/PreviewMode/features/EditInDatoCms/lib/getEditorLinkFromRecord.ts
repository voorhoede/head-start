import itemTypesJson from '@lib/datocms/item-types.json';
import { getModelApiKey } from '@lib/datocms/modelApiKeys';
import type { DatoCmsRecordIdentity } from '@lib/datocms/recordIdentity';
import { datocmsEnvironment } from '@root/datocms-environment';
import { buildEditorLink } from './buildEditorLink';

type ItemTypesMap = Record<string, { id: string }>;
const itemTypes: ItemTypesMap = itemTypesJson;

export function getEditorLinkFromRecord(
  record: DatoCmsRecordIdentity | null | undefined,
  environment?: string,
): string | null {
  const id = record?.id;
  if (!id) return null;

  const modelApiKey = getModelApiKey(record.__typename);
  const itemTypeId = modelApiKey ? itemTypes[modelApiKey]?.id ?? null : null;

  const env = environment ?? datocmsEnvironment;
  return buildEditorLink(id, itemTypeId, env);
}

