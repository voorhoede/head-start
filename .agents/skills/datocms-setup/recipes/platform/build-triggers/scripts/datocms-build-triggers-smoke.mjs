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

function usage() {
  console.error(
    [
      'Usage:',
      '  node scripts/datocms-build-triggers-smoke.mjs list',
      '  node scripts/datocms-build-triggers-smoke.mjs trigger <id-or-name>',
      '  node scripts/datocms-build-triggers-smoke.mjs events [--limit=10]',
    ].join('\n'),
  );
}

async function resolveTrigger(client, identifier) {
  const triggers = await client.buildTriggers.list();
  const lowerIdentifier = identifier.toLowerCase();

  return triggers.find(
    (trigger) => trigger.id === identifier || trigger.name.toLowerCase() === lowerIdentifier,
  );
}

async function listTriggers(client) {
  const triggers = await client.buildTriggers.list();

  for (const trigger of triggers) {
    console.log(
      [
        trigger.id,
        trigger.name,
        trigger.adapter,
        trigger.enabled ? 'enabled' : 'disabled',
        trigger.build_status ?? 'unknown',
      ].join('\t'),
    );
  }
}

async function triggerDeploy(client, identifier) {
  const trigger = await resolveTrigger(client, identifier);

  if (!trigger) {
    throw new Error(`Could not resolve a build trigger by id or name: ${identifier}`);
  }

  await client.buildTriggers.trigger(trigger.id);
  console.log(`triggered ${trigger.name} (${trigger.id})`);
}

async function listEvents(client, limit) {
  let count = 0;

  for await (const event of client.buildEvents.listPagedIterator()) {
    console.log(
      [
        event.id,
        event.event_type,
        event.build_trigger?.id ?? '',
        event.created_at ?? '',
      ].join('\t'),
    );

    count += 1;
    if (count >= limit) {
      break;
    }
  }
}

async function main() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.length === 0 || rawArgs.includes('--help')) {
    usage();
    process.exit(rawArgs.includes('--help') ? 0 : 1);
  }

  const buildClient = await loadBuildClient();
  const client = buildClient({ apiToken: requireEnv('DATOCMS_API_TOKEN') });

  const [command, ...rest] = rawArgs;

  if (command === 'list') {
    await listTriggers(client);
    return;
  }

  if (command === 'trigger') {
    const identifier = rest[0];

    if (!identifier) {
      usage();
      process.exit(1);
    }

    await triggerDeploy(client, identifier);
    return;
  }

  if (command === 'events') {
    const limitArg = rest.find((arg) => arg.startsWith('--limit='));
    const limit = limitArg ? Number.parseInt(limitArg.slice('--limit='.length), 10) : 10;

    await listEvents(client, Number.isFinite(limit) && limit > 0 ? limit : 10);
    return;
  }

  usage();
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
