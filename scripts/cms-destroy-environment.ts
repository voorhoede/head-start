import { catchError, execCommandStrict, cancel } from './lib/exec-command';
import {
  getPrimaryEnvironment,
  getTargetSandBoxEnvironment,
  updateLocalEnvironment,
} from './lib/environments';
import confirm from '@inquirer/confirm';
import { getProjectName } from './lib/projects';
import { color } from './lib/color';
import { stripIndents } from 'proper-tags';
import { input } from '@inquirer/prompts';

const printSuccessMessage = (environmentName: string) => {
  console.log(stripIndents`
    🗑️  ${color.green('Deletion successful!')} Environment ${color.blue(environmentName)} has been deleted.
  `);
};

const execDeleteSandboxEnvironment = async (environmentName: string) => {
  const deleteCommand = `npx datocms environments:destroy ${environmentName}`;
  const logMessage = `🗑️  Destroying sandbox environment '${color.blue(environmentName)}'`;
  await execCommandStrict(deleteCommand, logMessage);
};

const isConfirmedDeleteSandboxEnvironment = async (targetEnvironment: string): Promise<boolean> => {
  const projectName = await getProjectName();
  console.log(`\n⚠️  You are about to destroy environment ${color.blue(targetEnvironment)} of project ${color.yellow(projectName)}`);
  const inputValue = await input({
    message: `Type ${color.red(targetEnvironment)} to confirm:`,
  });

  return inputValue === targetEnvironment;
};

const askForSettingLocalEnvironmentToPrimary = async (
  primaryEnvironment: string,
) => {
  const allow = await confirm({
    message: `📝 Do you want to update the local environment in ${color.yellow('datocms-environment.ts')} to the primary environment ${color.blue(primaryEnvironment)}?`,
    default: false,
  });
  return allow;
};

export const deleteSandboxEnvironment = async (environmentName: string) => {
  const allow = await isConfirmedDeleteSandboxEnvironment(environmentName);
  if(allow) {
    await execDeleteSandboxEnvironment(environmentName);
    printSuccessMessage(environmentName);
  }
  else {
    console.log(stripIndents`
      🚫 Deletion cancelled. Environment name did not match.
    `);
    await cancel();
  }
};

export default async function run() {
  const targetEnvironment = await getTargetSandBoxEnvironment();
  await deleteSandboxEnvironment(targetEnvironment);

  // Ask for updating the local environment to the primary environment
  const primaryEnvironment = await getPrimaryEnvironment();
  const isUpdateLocalEnvironment: boolean =
    await askForSettingLocalEnvironmentToPrimary(primaryEnvironment);
  if (isUpdateLocalEnvironment) {
    await updateLocalEnvironment(primaryEnvironment);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(catchError);
}
