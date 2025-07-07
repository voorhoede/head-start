import { cancelByUser, catchError, execCommandSafe, execCommandStrict, getExecConfirmationMessage } from './lib/exec-command';
import {
  getPrimaryEnvironment,
  getTargetSandBoxEnvironment,
  updateLocalEnvironment,
} from './lib/environments';
import confirm from '@inquirer/confirm';
import { getProjectName } from './lib/projects';
import { color } from './lib/color';
import { stripIndents } from 'proper-tags';

const printSuccessMessage = (environmentName: string) => {
  console.log(stripIndents`
    🗑️  ${color.green('Deletion successful!')} Environment ${color.blue(environmentName)} has been deleted.
  `);
};

const execDeleteSandboxEnvironment = async (environmentName: string, isStrict: boolean) => {
  const deleteCommand = `npx datocms environments:destroy ${environmentName}`;
  const logMessage = `🗑️  Destroying sandbox environment '${color.blue(environmentName)}'`;
  if (isStrict) {
    await execCommandStrict(deleteCommand, logMessage);
  } else {
    await execCommandSafe(deleteCommand);
  }
};

const isConfirmedDeleteSandboxEnvironment = async (targetEnvironment: string) => {
  const projectName = await getProjectName();

  const message = stripIndents`
    Destroy the environment ${color.blue(targetEnvironment)} of project ${color.yellow(projectName)}`;
  return await confirm(getExecConfirmationMessage(message));
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

export const deleteSandboxEnvironment = async (environmentName: string, isStrict: boolean) => {
  const allow = await isConfirmedDeleteSandboxEnvironment(environmentName);
  if(allow) {
    await execDeleteSandboxEnvironment(environmentName, isStrict);
    printSuccessMessage(environmentName);
  }
  else if(!isStrict) {
    await cancelByUser();
  }
};

export default async function run() {
  const targetEnvironment = await getTargetSandBoxEnvironment();
  await deleteSandboxEnvironment(targetEnvironment, false);

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
