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

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const rawArgs = process.argv.slice(2);

if (rawArgs.includes('--help')) {
  console.error(
    'Usage: node scripts/datocms-import-contentful.mjs [--autoconfirm] [extra datocms contentful:import flags]',
  );
  process.exit(0);
}

requireEnv('DATOCMS_API_TOKEN');

const args = [
  'contentful:import',
  `--contentful-space-id=${requireEnv('CONTENTFUL_SPACE_ID')}`,
  `--contentful-token=${requireEnv('CONTENTFUL_TOKEN')}`,
];

if (process.env.CONTENTFUL_ENVIRONMENT) {
  args.push(`--contentful-environment=${process.env.CONTENTFUL_ENVIRONMENT}`);
}

args.push(...rawArgs);

run(args);
