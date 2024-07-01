import { readFile, writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

type FileRecord = {
  slug?: string;
  file: {
    upload_id: string;
  }
}
type RedirectRuleRecord = {
  from: string;
  to: string;
  status_code: string;
  [key: string]: string | object;
}
type RedirectRule = {
  from: string;
  to: string;
  statusCode: '200'|'301'|'302';
}

// use client instead of http api for pagination support
const client = buildClient({
  apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
  environment: datocmsEnvironment,
});
const rulesToText = (rules: RedirectRule[]) => rules.map(rule => `${rule.from} ${rule.to} ${rule.statusCode}`).join('\n');

async function fetchRedirectRules() {
  const redirectRules: RedirectRule[] = [];

  for await (const item of client.items.listPagedIterator({ filter: { type: 'redirect_rule' } }) as unknown as RedirectRuleRecord[]) {
    redirectRules.push({
      from: item.from,
      to: item.to,
      statusCode: item.status_code as RedirectRule['statusCode'],
    });
  }
  return redirectRules;
}

async function fetchFileRedirectRules() {
  const redirectRules: RedirectRule[] = [];
    
  for await (const item of client.items.listPagedIterator({ filter: { type: 'file' } }) as unknown as FileRecord[]) {
    if (!item.slug) {
      continue;
    }
    const file = await client.uploads.find(item.file.upload_id);

    redirectRules.push({
      from: item.slug,
      to: file.url.replace('https://www.datocms-assets.com/', '/files/'),
      statusCode: '200',
    });
  }
  return redirectRules;
}

async function downloadRedirectRules() {
  const fileRedirects = await fetchFileRedirectRules();
  const redirects = await fetchRedirectRules();
  const existingFile = await readFile('./dist/_redirects', 'utf-8');

  const combinedFile = [
    '# Static redirects from public/_redirects:',
    existingFile,
    '',
    '# File record redirects from DatoCMS:',
    rulesToText(fileRedirects),
    '',
    '# Redirect rule records from DatoCMS:',
    rulesToText(redirects),
  ].join('\n');

  await writeFile('./dist/_redirects', combinedFile);
}

downloadRedirectRules()
  .then(() => console.log('RedirectRules downloaded'));
