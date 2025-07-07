import dotenv from 'dotenv-safe';
import { stripIndents } from 'proper-tags';
import { catchError, execCommandSafe } from './lib/exec-command';
import {
  getNewSandboxEnvironment,
  getPrimaryEnvironment,
  updateLocalEnvironment,
} from './lib/environments';
import { getProjectName } from './lib/projects';
import { color } from './lib/color';
import confirm from '@inquirer/confirm';

dotenv.config({
  allowEmptyValues: Boolean(process.env.CI),
});

type EnvironmentDetails = {
  sourceEnv: string;
  isRunAllMigrations: boolean;
  projectName: string;
  targetEnvironment: string;
};

const getConfirmationMessage = ({
  sourceEnv,
  targetEnvironment,
  projectName,
  isRunAllMigrations,
}: EnvironmentDetails) => stripIndents`
    Create a new sandbox environment based on primary environment ${color.blue(sourceEnv)} with the name ${color.blue(targetEnvironment)} for project ${color.yellow(projectName)}.
    ${isRunAllMigrations ? color.green('  New migration files will be run in chronological order') : color.red('  New migration files will not be run')}.
  `;

const runAllMigrations = async (environmentDetails: EnvironmentDetails) => {
  return await execCommandSafe(
    ` npx datocms migrations:run --destination=${environmentDetails.targetEnvironment}`,
    getConfirmationMessage(environmentDetails),
  );
};

export const runCreateEnvironment = async (
  environmentDetails: EnvironmentDetails,
) => {
  return await execCommandSafe(
    `npx datocms environments:fork ${environmentDetails.sourceEnv} ${environmentDetails.targetEnvironment} --fast`,
    getConfirmationMessage(environmentDetails),
  );
};

export default async function run() {
  const targetEnvironment = await getNewSandboxEnvironment();
  const isRunAllMigrations = await confirm({
    message: 'Do you want to run all new migration files?',
    default: true,
  });
  const sourceEnv = await getPrimaryEnvironment();
  const projectName = await getProjectName();
  const environmentDetails: EnvironmentDetails = {
    sourceEnv,
    targetEnvironment,
    projectName,
    isRunAllMigrations,
  };

  let result = false;
  if (isRunAllMigrations) {
    result = await runAllMigrations(environmentDetails);
  } else {
    result = await runCreateEnvironment(environmentDetails);
  }
  if (result) {
    await updateLocalEnvironment(targetEnvironment);
    console.log(
      `✨ ${color.green('Creation successful!')} New sandbox environment ${color.blue(targetEnvironment)} has been created.`,
    );
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(catchError);
}
