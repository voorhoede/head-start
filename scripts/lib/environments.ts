import { datocmsEnvironment } from '../../datocms-environment';
import dotenv from 'dotenv-safe';
import { input, select } from '@inquirer/prompts';
import fs from 'fs';
import { color } from './color';
import { execAsync } from './exec-command';

dotenv.config();

// NOTE: I am aware that I could also use the datocms API to get wheter or not an environment is primary
// but this would involve trimming the output of the command and can be risky if the output format
export const getEnvironments = async (): Promise<string[]> => {
  try {
    const environments = await execAsync(
      'npx datocms environments:list --no-header --columns=id',
    ).then(({ stdout }) =>
      stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.trim()),
    );
    return environments;
  } catch (error) {
    throw new Error('Failed to get environments', { cause: error });
  }
};

const sandboxEnvironmentQuestion = {
  message: 'Which sandbox environment do you want to target?',
  defaultChoice: {
    name: `Use default: ${color.blue(datocmsEnvironment)}`,
    value: datocmsEnvironment,
    description: 'Use the environment specified in datocms-environment.ts',
  },
};

export const getNewSandboxEnvironment = async () => {
  const branchName = await execAsync('git branch --show-current').then(
    ({ stdout }) =>
      stdout
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase(),
  );

  const choice = await select({
    message: sandboxEnvironmentQuestion.message,
    choices: [
      sandboxEnvironmentQuestion.defaultChoice,
      {
        name: `Use branch name: ${color.blue(branchName)}`,
        value: branchName,
        description: 'Use your current branch name as the environment name',
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

  return choice;
};

export const getTargetSandBoxEnvironment = async () => {
  const allEnvironments = await getEnvironments();

  // exclude the primary environment from the list
  // the primary environment cannot be destroyed or mutated
  const primaryEnvironment = await getPrimaryEnvironment();
  const environments = allEnvironments.filter((env) => {
    return env !== primaryEnvironment;
  });
  const choice = await select({
    message: sandboxEnvironmentQuestion.message,
    choices: environments.map((env) => ({
      name: color.blue(env),
      value: env,
    })),
  });

  return choice;
};

export const getPrimaryEnvironment = async () => {
  const primary = await execAsync('npx datocms environments:primary').then(
    ({ stdout }) => stdout.trim(),
  );

  if (!primary) {
    throw new Error('No primary environment found');
  }

  return primary;
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
    `✅ ${color.yellow('datocms-environment.ts')} has been updated to ${color.blue(environmentName)}`,
  );
};
