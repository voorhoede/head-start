import { buildClient } from '@datocms/cma-client-node';
import dotenv from 'dotenv-safe';
import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

const getPrimaryEnvironment = async () => {
  const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN });
  const environments = await client.environments.list();
  return environments.find(env => env.meta.primary)?.id;
};

async function run() {
  const sourceEnv = await getPrimaryEnvironment();
  execCommand(`npx datocms environments:fork ${sourceEnv} ${datocmsEnvironment} --fast`);
}

run();
