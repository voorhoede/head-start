export type Model = {
  item_type: string,
  id: string,
  [key: string]: unknown,
}

export type BackupRecord = Record<string, unknown>;

export type ModelBackup = {
  model: Model,
  records: BackupRecord[],
}

export type BackupTree = {
  assets: string[],
  records: ModelBackup[],
};

export const ASSETS_DIRNAME = 'assets';
export const RECORDS_DIRNAME = 'records';
export const MODEL_FILENAME = 'model.json';
export const TYPES_FILENAME = 'types.json';
export const RECORDS_FILENAME = 'records.json';
