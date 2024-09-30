import { writeFile } from 'node:fs/promises';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

type RedirectRuleRecord = {
  from: string;
  to: string;
  status_code: string;
  [key: string]: string | object;
}
type RedirectRule = {
  from: string;
  to: string;
  statusCode: '301'|'302';
}

async function fetchRedirectRules() {
  // use client instead of http api for pagination support
  const client = buildClient({
    apiToken: process.env.DATOCMS_READONLY_API_TOKEN!,
    environment: datocmsEnvironment,
  });
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

async function downloadRedirectRules() {
  const redirectRules = await fetchRedirectRules();
  await writeFile('./src/lib/routing/redirects.json', JSON.stringify(redirectRules, null, 2));
}

downloadRedirectRules()
  .then(() => console.log('RedirectRules downloaded'));
