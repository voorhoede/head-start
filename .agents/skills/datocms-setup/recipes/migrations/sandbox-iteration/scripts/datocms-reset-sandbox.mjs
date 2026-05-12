import { spawnSync } from 'node:child_process';

function run(args, options = {}) {
  const result = spawnSync('npx', ['datocms', ...args], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: options.capture ? 'pipe' : 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: npx datocms ${args.join(' ')}`);
  }

  return result.stdout ?? '';
}

function parseArgs(argv) {
  const parsed = {
    force: false,
    help: false,
    migrationArgs: [],
    profile: undefined,
    sandbox: undefined,
    skipMigrations: false,
    source: undefined,
    useFastFork: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help') {
      parsed.help = true;
      continue;
    }

    if (arg === '--skip-migrations') {
      parsed.skipMigrations = true;
      continue;
    }

    if (arg === '--fast-fork') {
      parsed.useFastFork = true;
      continue;
    }

    if (arg === '--force') {
      parsed.force = true;
      continue;
    }

    if (arg.startsWith('--sandbox=')) {
      parsed.sandbox = arg.slice('--sandbox='.length);
      continue;
    }

    if (arg.startsWith('--source=')) {
      parsed.source = arg.slice('--source='.length);
      continue;
    }

    if (arg.startsWith('--profile=')) {
      parsed.profile = arg.slice('--profile='.length);
      continue;
    }

    if (arg === '--') {
      parsed.migrationArgs.push(...argv.slice(i + 1));
      break;
    }

    parsed.migrationArgs.push(arg);
  }

  return parsed;
}

function usage() {
  console.error(
    [
      'Usage:',
      '  node scripts/datocms-reset-sandbox.mjs --sandbox=<env-id>',
      '    [--source=<env-id>] [--profile=<profile-id>]',
      '    [--skip-migrations] [--fast-fork] [--force] [-- <migration args>]',
      '',
      'This helper only destroys, forks, and optionally reruns migrations.',
      'It never promotes an environment and never toggles maintenance mode.',
      'Use --fast-fork and --force only for operator-approved large sandboxes.',
    ].join('\n'),
  );
}

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.sandbox) {
  usage();
  process.exit(args.help ? 0 : 1);
}

const globalArgs = args.profile ? [`--profile=${args.profile}`] : [];
const source =
  args.source ??
  run(['environments:primary', ...globalArgs], { capture: true }).trim();

try {
  run(['environments:destroy', args.sandbox, ...globalArgs]);
} catch (_error) {
  console.log(`Sandbox ${args.sandbox} does not exist yet. Skipping destroy.`);
}

const forkArgs = ['environments:fork', source, args.sandbox, ...globalArgs];

if (args.useFastFork) {
  forkArgs.push('--fast');
}

if (args.force) {
  forkArgs.push('--force');
}

run(forkArgs);

if (!args.skipMigrations) {
  run(
    [
      'migrations:run',
      `--source=${args.sandbox}`,
      '--in-place',
      ...globalArgs,
      ...args.migrationArgs,
    ],
  );
}
