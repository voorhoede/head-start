import { spawnSync } from 'node:child_process';

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
      '  node scripts/datocms-release.mjs --destination=<env-id>',
      '    [--profile=<profile-id>] [--dry-run] [--skip-promote]',
      '    [--fast-fork] [--force] [-- <extra migrations:run args>]',
      '',
      'Dry run: only runs migrations:run --dry-run and skips maintenance/promotion.',
    ].join('\n'),
  );
}

function parseArgs(argv) {
  const parsed = {
    destination: undefined,
    dryRun: false,
    extraArgs: [],
    fastFork: false,
    force: false,
    help: false,
    profile: undefined,
    skipPromote: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help') {
      parsed.help = true;
      continue;
    }

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--skip-promote') {
      parsed.skipPromote = true;
      continue;
    }

    if (arg === '--fast-fork') {
      parsed.fastFork = true;
      continue;
    }

    if (arg === '--force') {
      parsed.force = true;
      continue;
    }

    if (arg.startsWith('--destination=')) {
      parsed.destination = arg.slice('--destination='.length);
      continue;
    }

    if (arg === '--destination') {
      parsed.destination = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--profile=')) {
      parsed.profile = arg.slice('--profile='.length);
      continue;
    }

    if (arg === '--profile') {
      parsed.profile = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--') {
      parsed.extraArgs.push(...argv.slice(i + 1));
      break;
    }

    parsed.extraArgs.push(arg);
  }

  return parsed;
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  usage();
  process.exit(0);
}

if (!args.destination) {
  usage();
  process.exit(1);
}

if (args.dryRun) {
  run([
    'migrations:run',
    `--destination=${args.destination}`,
    ...(args.profile ? [`--profile=${args.profile}`] : []),
    ...(args.fastFork ? ['--fast-fork'] : []),
    '--dry-run',
    ...args.extraArgs,
  ]);
  process.exit(0);
}

try {
  const maintenanceArgs = ['maintenance:on'];

  if (args.profile) {
    maintenanceArgs.push(`--profile=${args.profile}`);
  }

  if (args.force) {
    maintenanceArgs.push('--force');
  }

  run(maintenanceArgs);

  const migrationArgs = [
    'migrations:run',
    `--destination=${args.destination}`,
  ];

  if (args.profile) {
    migrationArgs.push(`--profile=${args.profile}`);
  }

  if (args.fastFork) {
    migrationArgs.push('--fast-fork');
  }

  if (args.force && args.fastFork) {
    migrationArgs.push('--force');
  }

  migrationArgs.push(...args.extraArgs);

  run(migrationArgs);

  if (!args.skipPromote) {
    const promoteArgs = ['environments:promote', args.destination];

    if (args.profile) {
      promoteArgs.push(`--profile=${args.profile}`);
    }

    run(promoteArgs);
  }
} finally {
  try {
    run([
      'maintenance:off',
      ...(args.profile ? [`--profile=${args.profile}`] : []),
    ]);
  } catch (error) {
    console.error('Failed to disable maintenance mode.');
    console.error(error);
    process.exitCode = 1;
  }
}
