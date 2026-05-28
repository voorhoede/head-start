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
  let configPath = 'scripts/datocms-webhooks.config.mjs';

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
    'Usage: node scripts/datocms-sync-webhooks.mjs [--config=scripts/datocms-webhooks.config.mjs]',
  );
}

async function loadConfig(configPath) {
  const absolutePath = path.resolve(configPath);
  const mod = await import(pathToFileURL(absolutePath).href);
  const config = mod.default ?? mod.webhooks;
  const webhooks = Array.isArray(config) ? config : config?.webhooks;

  if (!Array.isArray(webhooks)) {
    throw new Error('Webhook config must default export an array or an object with webhooks: [].');
  }

  return webhooks;
}

function normalizeWebhook(webhook) {
  if (!webhook || typeof webhook !== 'object') {
    throw new Error('Webhook entries must be objects.');
  }

  return {
    name: webhook.name,
    url: webhook.url,
    headers: webhook.headers ?? {},
    events: webhook.events ?? [],
    custom_payload: webhook.custom_payload ?? null,
    http_basic_user: webhook.http_basic_user ?? null,
    http_basic_password: webhook.http_basic_password ?? null,
    enabled: webhook.enabled ?? true,
    payload_api_version: webhook.payload_api_version ?? '3',
    nested_items_in_payload: webhook.nested_items_in_payload ?? false,
    auto_retry: webhook.auto_retry ?? true,
  };
}

async function main() {
  const { help, configPath } = parseArgs(process.argv.slice(2));

  if (help) {
    usage();
    return;
  }

  const buildClient = await loadBuildClient();
  const client = buildClient({ apiToken: requireEnv('DATOCMS_API_TOKEN') });
  const desiredWebhooks = await loadConfig(configPath);
  const existingWebhooks = await client.webhooks.list();

  for (const desiredWebhook of desiredWebhooks) {
    const payload = normalizeWebhook(desiredWebhook);

    if (!payload.name || !payload.url || payload.events.length === 0) {
      throw new Error('Each webhook must include name, url, and at least one events entry.');
    }

    const existingWebhook = existingWebhooks.find((webhook) => webhook.name === payload.name);

    if (existingWebhook) {
      await client.webhooks.update(existingWebhook.id, payload);
      console.log(`updated ${payload.name}`);
      continue;
    }

    await client.webhooks.create(payload);
    console.log(`created ${payload.name}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
