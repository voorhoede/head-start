import { writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

async function fetchTranslations() {
  // use client instead of http api for pagination support
  const client = buildClient({
    apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
    environment: datocmsEnvironment,
  });
  const { locales } = await client.site.find();
  const translations = Object.fromEntries(locales.map(locale => [locale, {}]));
    
  for await (const item of client.items.listPagedIterator({ filter: { type: 'translation' } })) {
    locales.forEach(locale => {
      // @ts-expect-error dato item is not typed
      translations[locale][item.key] = item.value[locale];
    });
  }
  return translations;
}

async function downloadTranslations() {
  const translations = await fetchTranslations();
  await writeFile('./src/lib/i18n.messages.json', JSON.stringify(translations, null, 2));
}

downloadTranslations()
  .then(() => console.log('Translations downloaded'));
