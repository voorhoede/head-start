import { execSync } from 'node:child_process';
import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';

dotenv.config();

const { DATOCMS_API_TOKEN, WORKERS_CI, WORKERS_CI_BRANCH } = process.env;
const command = 'npm run build';

async function notifyDatocms({ status }: { status: 'success' | 'error' }) {
  if (!WORKERS_CI) {
    console.log('Not on Cloudflare Workers Builds. Skipping notify DatoCMS');
    return;
  }

  const client = buildClient({ apiToken: DATOCMS_API_TOKEN! });
  const triggers = await client.buildTriggers.list();
  const matchingTrigger = triggers.find(trigger => {
    const payload = trigger.adapter_settings?.payload as { branch?: string };
    return payload?.branch === WORKERS_CI_BRANCH;
  });
  if (!matchingTrigger) {
    console.log(`No matching DatoCMS build trigger found for branch '${WORKERS_CI_BRANCH}'`);
    return;
  }

  try {
    await fetch(matchingTrigger.webhook_url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    console.log(`🔔 Notified DatoCMS of deploy status: ${ status }`);
  } catch (error) {
    console.error('Error trying to notify DatoCMS of deploy status', { status, error });
  }
}

async function build() {
  try {
    execSync(command, { stdio: 'inherit' });
    await notifyDatocms({ status: 'success' });
  } catch (error) {
    await notifyDatocms({ status: 'error' });
    console.error(error);
    process.exit(1);
  }
}

build();
