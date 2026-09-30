import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';

dotenv.config();

const { DATOCMS_API_TOKEN, GITHUB_ACTIONS, GITHUB_REF_NAME } = process.env;
const status = process.argv[2] === 'success' ? 'success' : 'error';

async function notifyDatocms({ status }: { status: 'success' | 'error' }) {
  if (!GITHUB_ACTIONS) {
    console.log('Not on GitHub Actions. Skipping notify DatoCMS');
    return;
  }

  const client = buildClient({ apiToken: DATOCMS_API_TOKEN! });
  const triggers = await client.buildTriggers.list();
  const matchingTrigger = triggers.find(trigger => {
    const payload = trigger.adapter_settings?.payload as { branch?: string };
    return payload?.branch === GITHUB_REF_NAME;
  });
  if (!matchingTrigger) {
    console.log(`No matching DatoCMS build trigger found for branch '${GITHUB_REF_NAME}'`);
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

notifyDatocms({ status });
