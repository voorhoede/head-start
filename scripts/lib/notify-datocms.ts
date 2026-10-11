import { buildClient } from '@datocms/cma-client-node';

export type DeployStatus = 'success' | 'error';

type TriggerPayload = { branch?: string; env?: string };

/**
 * Finds the DatoCMS build trigger that started the current Workers Build.
 * Production and preview are both built from `main`, by different Workers.
 * A trigger's payload names the branch and, for the preview Worker, the
 * Wrangler environment (`env: "preview"`, matching CLOUDFLARE_ENV).
 */
export function findMatchingTrigger<T extends { adapter_settings?: unknown }>(
  triggers: T[],
  { branch, env }: { branch?: string; env?: string },
): T | undefined {
  // Without a branch nothing can match: a trigger without a payload must not.
  if (!branch) return undefined;
  return triggers.find((trigger) => {
    const settings = trigger.adapter_settings as { payload?: TriggerPayload } | null | undefined;
    const payload = settings?.payload ?? {};
    return payload.branch === branch && (payload.env ?? '') === (env ?? '');
  });
}

/**
 * Reports the build/deploy result to the matching DatoCMS build trigger,
 * so the build status shown in DatoCMS reflects the deployment.
 * Workers Builds runs the build command and the deploy command separately,
 * so `scripts/build.ts` only reports a failed build and `scripts/deploy.ts`
 * reports the outcome of `wrangler deploy`.
 */
export async function notifyDatocms({ status }: { status: DeployStatus }) {
  const { DATOCMS_API_TOKEN, WORKERS_CI, WORKERS_CI_BRANCH, CLOUDFLARE_ENV } = process.env;
  if (!WORKERS_CI) {
    console.log('Not on Cloudflare Workers Builds. Skipping notify DatoCMS');
    return;
  }

  const client = buildClient({ apiToken: DATOCMS_API_TOKEN! });
  const triggers = await client.buildTriggers.list();
  const matchingTrigger = findMatchingTrigger(triggers, { branch: WORKERS_CI_BRANCH, env: CLOUDFLARE_ENV });
  if (!matchingTrigger) {
    const env = CLOUDFLARE_ENV ? ` and env '${CLOUDFLARE_ENV}'` : '';
    console.log(`No matching DatoCMS build trigger found for branch '${WORKERS_CI_BRANCH}'${env}`);
    return;
  }
  if (!matchingTrigger.webhook_url) {
    console.log(`DatoCMS build trigger for branch '${WORKERS_CI_BRANCH}' has no webhook URL`);
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
