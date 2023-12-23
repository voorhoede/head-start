import { writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

type RenameKeys<T> = T extends object
  ? { [K in keyof T as Uncapitalize<string & K>]: RenameKeys<T[K]>; }
  : T;

/**
 * Recursively rename keys in an object from snake_case to camelCase.
 */
function renameKeys<T>(obj: T): RenameKeys<T> {
  if (Array.isArray(obj)) {
    return obj as RenameKeys<T>;
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelCasedKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase()) as keyof T;
      const modifiedValue = value !== null ? renameKeys(value) : value;
      return { ...acc, [camelCasedKey]: modifiedValue };
    }, {} as RenameKeys<T>);
  }
  return obj as RenameKeys<T>;
}

async function downloadSiteData() {
  const client = buildClient({
    apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
    environment: datocmsEnvironment,
  });
  const site = await client.site.find();
  await writeFile('./src/lib/site.json', JSON.stringify(renameKeys(site), null, 2));
}

downloadSiteData()
  .then(() => console.log('DatoCMS Site data downloaded'));
