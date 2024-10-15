import { writeFile, mkdtemp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import fetch from 'node-fetch';
import { datocmsEnvironment } from '../datocms-environment';

import {
  ASSETS_DIRNAME,
  RECORDS_DIRNAME,
  MODEL_FILENAME,
  TYPES_FILENAME,
  RECORDS_FILENAME,
  type BackupRecord,
} from './utils/backup.ts';


dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

let backupDir: string;

const client = buildClient({
  apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
  environment: datocmsEnvironment,
});

async function downloadImage(url: string, destination: string) {
  const response = await fetch(url);
  try {
    const buffer = await response.arrayBuffer();
    const fileName = new URL(url).pathname.split('/').pop()!;
    await writeFile(join(destination, fileName), new DataView(buffer));
  } catch (error) {
    throw new Error(`Failed to download image at ${url}: ${error}`);
  }
}

async function downloadAssets() {
  if (!backupDir) {
    throw new Error('Function ran without a temporary backup folder, can\'t continue.');
  }

  const path = join(backupDir, ASSETS_DIRNAME);
  await mkdir(path, { recursive: true });

  const site = await client.site.find();
  for await (const upload of client.uploads.listPagedIterator()) {
    const imageUrl = 'https://' + site.imgix_host + upload.path;
    console.log(`Downloading ${imageUrl}...`);
    downloadImage(imageUrl, path);
  }
}

async function downloadRecords() {
  if (!backupDir) {
    throw new Error('Function ran without a temporary backup folder, can\'t continue.');
  }

  const itemTypes = await client.itemTypes.list();
  await writeFile(join(backupDir, TYPES_FILENAME), JSON.stringify(itemTypes, null, 2), 'utf8');

  const models = itemTypes.filter((itemType) => !itemType.modular_block);
  const recordsByModel: Record<string, BackupRecord[]> = {};

  for (const model of models) {
    const key = model.api_key;
    recordsByModel[key] = [];

    const path = join(backupDir, RECORDS_DIRNAME, `${key}`);
    await mkdir(path, { recursive: true });
    await writeFile(join(path, MODEL_FILENAME), JSON.stringify(model, null, 2), 'utf8');

    for await (const record of client.items.listPagedIterator({
      nested: true,
      filter: { type: model.id },
    })) {
      recordsByModel[key].push(record);
    }

    await writeFile(join(path, RECORDS_FILENAME), JSON.stringify(recordsByModel[key], null, 2), 'utf8');
  }
}


async function downloadBackup() {
  console.log(`Downloading backup from ${datocmsEnvironment}...`);
  backupDir = await mkdtemp('./.backup-');

  return Promise.all([
    downloadRecords(),
    downloadAssets(),
  ]);
}

downloadBackup()
  .then(() => console.log(
    `DatoCMS backup of ${datocmsEnvironment} complete. View files in ${backupDir}`
  ));
