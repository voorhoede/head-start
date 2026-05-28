import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function run(args) {
  const result = spawnSync('npx', ['datocms', ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: npx datocms ${args.join(' ')}`);
  }
}

function usage() {
  console.error(
    [
      'Usage:',
      '  node scripts/datocms-autogenerate-migration.mjs "<name>" --from=<env>',
      '    [--to=<env>] [--profile=<profile-id>] [--ts] [--js] [--schema=<filter>]',
      '',
      'Autogenerate is schema-only: it captures model/field diffs, not records or uploads.',
    ].join('\n'),
  );
}

function inferMigrationFormat() {
  const migrationsDir = join(process.cwd(), 'migrations');

  if (existsSync(migrationsDir) && statSync(migrationsDir).isDirectory()) {
    const entries = readdirSync(migrationsDir, { withFileTypes: true });
    const hasTs = entries.some((entry) => entry.isFile() && entry.name.endsWith('.ts'));
    const hasJs = entries.some((entry) => entry.isFile() && entry.name.endsWith('.js'));

    if (hasTs && !hasJs) {
      return '--ts';
    }

    if (hasJs && !hasTs) {
      return '--js';
    }
  }

  if (existsSync(join(process.cwd(), 'tsconfig.json'))) {
    return '--ts';
  }

  return undefined;
}

const rawArgs = process.argv.slice(2);

if (rawArgs.length === 0 || rawArgs.includes('--help')) {
  usage();
  process.exit(rawArgs.includes('--help') ? 0 : 1);
}

const name = rawArgs[0];
let from;
let to;
const passthroughArgs = [];

for (let i = 1; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];

  if (arg.startsWith('--from=')) {
    from = arg.slice('--from='.length);
    continue;
  }

  if (arg === '--from') {
    from = rawArgs[i + 1];
    i += 1;
    continue;
  }

  if (arg.startsWith('--to=')) {
    to = arg.slice('--to='.length);
    continue;
  }

  if (arg === '--to') {
    to = rawArgs[i + 1];
    i += 1;
    continue;
  }

  passthroughArgs.push(arg);
}

if (!name || !from) {
  usage();
  process.exit(1);
}

const autogenerateTarget = to ? `${from}:${to}` : from;
const formatFlag =
  passthroughArgs.includes('--ts') || passthroughArgs.includes('--js')
    ? undefined
    : inferMigrationFormat();

run([
  'migrations:new',
  name,
  `--autogenerate=${autogenerateTarget}`,
  ...(formatFlag ? [formatFlag] : []),
  ...passthroughArgs,
]);
