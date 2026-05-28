import { pathToFileURL } from 'node:url';
import path from 'node:path';

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function loadBuildClient() {
  for (const packageName of [
    '@datocms/cma-client',
    '@datocms/cma-client-node',
    '@datocms/cma-client-browser',
  ]) {
    try {
      const mod = await import(packageName);

      if (typeof mod.buildClient === 'function') {
        return mod.buildClient;
      }
    } catch {
      // Try the next supported package.
    }
  }

  throw new Error(
    'No supported DatoCMS CMA client package found. Install @datocms/cma-client, @datocms/cma-client-node, or @datocms/cma-client-browser.',
  );
}

function parseArgs(argv) {
  let configPath = 'scripts/datocms-build-triggers.config.mjs';

  for (const arg of argv) {
    if (arg === '--help') {
      return { help: true, configPath };
    }

    if (arg.startsWith('--config=')) {
      configPath = arg.slice('--config='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { help: false, configPath };
}

function usage() {
  console.error(
    'Usage: node scripts/datocms-sync-build-triggers.mjs [--config=scripts/datocms-build-triggers.config.mjs]',
  );
}

async function loadConfig(configPath) {
  const absolutePath = path.resolve(configPath);
  const mod = await import(pathToFileURL(absolutePath).href);
  const config = mod.default ?? mod.buildTriggers ?? mod.triggers;
  const triggers = Array.isArray(config) ? config : config?.buildTriggers ?? config?.triggers;

  if (!Array.isArray(triggers)) {
    throw new Error(
      'Build trigger config must default export an array or an object with buildTriggers: [].',
    );
  }

  return triggers;
}

function normalizeAdapterSettings(adapter, adapterSettings = {}) {
  switch (adapter) {
    case 'custom':
      return {
        trigger_url: adapterSettings.trigger_url ?? '',
        headers: adapterSettings.headers ?? {},
        payload: adapterSettings.payload ?? {},
      };
    case 'gitlab':
      return {
        trigger_url: adapterSettings.trigger_url ?? '',
        token: adapterSettings.token ?? '',
        ref: adapterSettings.ref ?? 'main',
        build_parameters: adapterSettings.build_parameters ?? {},
      };
    case 'netlify':
      return {
        site_id: adapterSettings.site_id ?? '',
        trigger_url: adapterSettings.trigger_url ?? '',
        access_token: adapterSettings.access_token ?? '',
        branch: adapterSettings.branch ?? 'main',
      };
    case 'vercel':
      return {
        project_id: adapterSettings.project_id ?? '',
        team_id: adapterSettings.team_id ?? '',
        deploy_hook_url: adapterSettings.deploy_hook_url ?? '',
        token: adapterSettings.token ?? '',
        branch: adapterSettings.branch ?? 'main',
      };
    default:
      throw new Error(`Unsupported build trigger adapter: ${adapter}`);
  }
}

function normalizeTrigger(trigger) {
  if (!trigger || typeof trigger !== 'object') {
    throw new Error('Build trigger entries must be objects.');
  }

  return {
    name: trigger.name,
    adapter: trigger.adapter,
    adapter_settings: normalizeAdapterSettings(trigger.adapter, trigger.adapter_settings),
    frontend_url: trigger.frontend_url ?? null,
    autotrigger_on_scheduled_publications:
      trigger.autotrigger_on_scheduled_publications ?? true,
    enabled: trigger.enabled ?? true,
    webhook_token: trigger.webhook_token,
  };
}

function buildPayload(trigger) {
  const payload = normalizeTrigger(trigger);

  if (payload.webhook_token == null || payload.webhook_token === '') {
    delete payload.webhook_token;
  }

  return payload;
}

async function main() {
  const { help, configPath } = parseArgs(process.argv.slice(2));

  if (help) {
    usage();
    return;
  }

  const buildClient = await loadBuildClient();
  const client = buildClient({ apiToken: requireEnv('DATOCMS_API_TOKEN') });
  const desiredTriggers = await loadConfig(configPath);
  const existingTriggers = await client.buildTriggers.list();

  for (const desiredTrigger of desiredTriggers) {
    const payload = buildPayload(desiredTrigger);

    if (!payload.name || !payload.adapter) {
      throw new Error('Each build trigger must include name and adapter.');
    }

    const existingTrigger = existingTriggers.find((trigger) => trigger.name === payload.name);

    if (existingTrigger) {
      await client.buildTriggers.update(existingTrigger.id, payload);
      console.log(`updated ${payload.name}`);
      continue;
    }

    await client.buildTriggers.create(payload);
    console.log(`created ${payload.name}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
