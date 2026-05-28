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
    'Usage: node scripts/datocms-import-wordpress.mjs [--autoconfirm] [extra datocms wordpress:import flags]',
  );
  process.exit(0);
}

requireEnv('DATOCMS_API_TOKEN');

const jsonApiUrl = process.env.WORDPRESS_JSON_API_URL;
const wpUrl = process.env.WORDPRESS_URL;

if (!jsonApiUrl && !wpUrl) {
  throw new Error(
    'Missing WordPress URL. Set WORDPRESS_JSON_API_URL or WORDPRESS_URL.',
  );
}

const args = [
  'wordpress:import',
  jsonApiUrl ? `--wp-json-api-url=${jsonApiUrl}` : `--wp-url=${wpUrl}`,
  `--wp-username=${requireEnv('WORDPRESS_USERNAME')}`,
  `--wp-password=${requireEnv('WORDPRESS_PASSWORD')}`,
  ...rawArgs,
];

run(args);
