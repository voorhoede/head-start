import { getItemTypeId } from '@lib/datocms/itemTypes';
import type { DatoCmsRecordIdentity } from '@lib/datocms/recordIdentity';
import { datocmsEnvironment } from '@root/datocms-environment';
import { buildEditorLink } from './buildEditorLink';

export function getEditorLinkFromRecord(
  record: DatoCmsRecordIdentity | null | undefined,
  environment?: string,
): string | null {
  const id = record?.id;
  if (!id) return null;

  const itemTypeId = getItemTypeId(record.__typename);

  const env = environment ?? datocmsEnvironment;
  return buildEditorLink(id, itemTypeId, env);
}

