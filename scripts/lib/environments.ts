import { buildClient } from '@datocms/cma-client-node';
import { datocmsEnvironment } from '../../datocms-environment';
import dotenv from 'dotenv-safe';
import { input, select } from '@inquirer/prompts';
import fs from 'fs';
import { color } from './color';

dotenv.config();

export const checkSandboxEnvironment = async (
  environmentName: string,
) => {
  console.log(
    `🔍 Checking if sandbox environment ${color.blue(environmentName)} exists`,
  );
  const client = buildClient({ apiToken: process.env.DATOCMS_READONLY_API_TOKEN! });
  const datoCmsEnvironments = await client.environments.list();
  const exists = datoCmsEnvironments.some((env) => env.id === environmentName);
  if (exists) {
    console.log(
      `✅ Sandbox environment '${environmentName}' exists`,
    );
  } else {
    console.log(
      `🚫 Sandbox environment '${environmentName}' does not exist`,
    );
  }
  return exists;
};

export const getTargetSandBoxEnvironment = async () => {
  const choice = await select({
    message: 'Which sandbox environment do you want to target?',
    choices: [
      {
        name: `Use default: ${color.blue(datocmsEnvironment)}`,
        value: 'default',
        description: 'Use the environment specified in datocms-environment.ts',
      },
      {
        name: 'Enter custom name',
        value: 'custom',
        description: 'Specify a custom environment name',
      },
    ],
  });

  if (choice === 'custom') {
    const customEnv = await input({
      message: '📝 Enter the environment name:',
      validate: (value) => {
        if (!value.trim()) {
          return 'Environment name cannot be empty';
        }
        return true;
      },
    });
    return customEnv;
  }

  return datocmsEnvironment;
};

export const getPrimaryEnvironment = async () => {
  const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN });
  const environments = await client.environments.list();
  const primaryEnvironment = environments.find(env => env.meta.primary)?.id;
  if (!primaryEnvironment) {
    throw new Error('No primary environment found');
  }
  return primaryEnvironment;
};

// replace the datocmsEnvironment in datocms-environment.ts with the new environment name
export const updateLocalEnvironment = async (environmentName: string) => {
  const datocmsEnvironmentFile = fs.readFileSync(
    'datocms-environment.ts',
    'utf8',
  );
  // Use regex to find and replace the environment value, making it more robust
  const updatedDatocmsEnvironmentFile = datocmsEnvironmentFile.replace(
    /export const datocmsEnvironment = ['"`]([^'"`]*)['"`];/,
    `export const datocmsEnvironment = '${environmentName}';`,
  );
  fs.writeFileSync('datocms-environment.ts', updatedDatocmsEnvironmentFile);
  console.log(
    `✅ datocms-environment.ts has been updated to ${color.blue(environmentName)}`,
  );
};
