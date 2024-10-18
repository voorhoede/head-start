import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

import {
  ASSETS_DIRNAME,
  RECORDS_DIRNAME,
  MODEL_FILENAME,
  RECORDS_FILENAME,
  type Model,
  type BackupRecord,
  type BackupTree,
  type ModelBackup,
} from './utils/backup.ts';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

let dir: string;

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN!,
  environment: datocmsEnvironment,
});

async function getTargetBackup() {
  const backups = (await readdir('./')).filter(items => items.startsWith('.backup-'));
  const [_node, _file, backup] = process.argv;

  if (backups.includes(backup)) {
    return backup;
  }

  switch(backups.length) {
  case 0: throw new Error('No backups found');
  case 1: return backups[0];
  default:
    throw new Error(`Multiple backups found:\n${
      backups.map(s => `- ${s}`).join('\n')
    }\nPlease rerun with the backup name, ie. 'npm run restore ${backups[0]}'`);
  }
}

async function loadBackup(dir: string) {
  return {
    assets: await readdir(join(dir, ASSETS_DIRNAME)),
    records: await loadModelBackups(join(dir, RECORDS_DIRNAME)),
  } satisfies BackupTree;
}

async function loadModelBackups(directory: string) {
  const items: ModelBackup[] = await Promise.all((await readdir(directory))
    .map(async key => {
      const modelDir = join(directory, key);
      return {
        model: JSON.parse(await readFile(join(modelDir, MODEL_FILENAME), 'utf8')),
        records: JSON.parse(await readFile(join(modelDir, RECORDS_FILENAME), 'utf8')),
      } satisfies ModelBackup;
    }));
  return items;
}

async function createModel(model: Model) {
  return client.itemTypes.create(model);
}

async function createRecord(model: Model, record: BackupRecord) {
  const { type, id } = model;
  return client.items.create({
    item_type: {
      type,
      id,
    },
    record
  });
}

async function restoreBackup() {
  dir = await getTargetBackup();
  console.log(`Restoring ${dir} to environment ${datocmsEnvironment}`);

  const { records } = await loadBackup(dir);

  return Promise.all(records.map(async ({ model, records }) => {
    await createModel(model);
    return Promise.all(records.map(record => createRecord(model, record)));
  }));
}

restoreBackup()
  .then(() => console.log(`DatoCMS restore from ${dir} to ${datocmsEnvironment} complete.`));
