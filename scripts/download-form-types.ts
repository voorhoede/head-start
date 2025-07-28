import { writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

async function fetchFormTypes() {
  // use client instead of http api for pagination support
  const client = buildClient({
    apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
    environment: datocmsEnvironment,
  });

  const formKeys = [];

  for await (const item of client.items.listPagedIterator({ filter: { type: 'form' } })) {
    formKeys.push(item.key);
  }
  return { formKeys };
}

async function downloadFormTypes() {
  const { formKeys } = await fetchFormTypes();
  await writeFile('./src/lib/forms/types.ts',
    `export type FormKey = \n | ${formKeys.map(key => `'${key}'`).join('\n | ')};\n`
  );
}

downloadFormTypes()
  .then(() => console.log('Form types downloaded'));
