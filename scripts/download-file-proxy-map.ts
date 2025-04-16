import { writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

type FileRecord = {
  path?: string;
  file: {
    upload_id: string;
  }
}
type FilePathMap = {
  [key: string]: string;
};

async function getFileProxyMap() {
  // use client instead of http api for pagination support
  const client = buildClient({
    apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
    environment: datocmsEnvironment,
  });

  const filePathMap: FilePathMap = {};
    
  for await (const item of client.items.listPagedIterator({ filter: { type: 'file' } }) as unknown as FileRecord[]) {
    if (item.path) {
      const asset = await client.uploads.find(item.file.upload_id);
      if (asset) {
        filePathMap[item.path] = asset.url;
      }
    }
  }
  return filePathMap;
}

async function downloadFileProxyMap() {
  const files = await getFileProxyMap();
  await writeFile('./src/lib/routing/file-proxy-map.json', JSON.stringify(files, null, 2));
}

downloadFileProxyMap()
  .then(() => console.log('File paths downloaded'));
