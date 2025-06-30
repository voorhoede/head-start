import { cancelByUser, execCommandSafe } from './lib/exec-command';
import {
  checkSandboxEnvironment,
  getTargetSandBoxEnvironment,
} from './lib/environments';
import confirm from '@inquirer/confirm';
import { getProjectName } from './lib/projects';
import { color } from './lib/color';
import { stripIndents } from 'proper-tags';

const destroyEnvironment = async (environmentName: string) => {
  console.log(`🗑️ Destroying sandbox environment '${environmentName}'`);
  execCommandSafe(`npx datocms environments:destroy ${environmentName}`);
};

export const getDeleteConfirmationMessage = async (
  targetEnvironment: string,
) => {
  const projectName = await getProjectName();

  return stripIndents`
    Destroy the environment ${color.blue(targetEnvironment)} of project ${color.yellow(projectName)}`;
};

export default async function run() {
  let targetEnvironment = await getTargetSandBoxEnvironment();
  let isEnvironmentValid = await checkSandboxEnvironment(targetEnvironment);
  while (!isEnvironmentValid) {
    console.warn(
      `${color.yellow('Please provide a valid environment name or create a new environment.')}`,
    );
    targetEnvironment = await getTargetSandBoxEnvironment();
    isEnvironmentValid = await checkSandboxEnvironment(targetEnvironment);
  }

  const confirmationMessage =
    await getDeleteConfirmationMessage(targetEnvironment);

  const allow = await confirm({
    message: `⚠️ ${confirmationMessage}\n\nAre you sure you want to continue?`,
    default: false,
  });

  if (allow) {
    await destroyEnvironment(targetEnvironment);
  } else {
    await cancelByUser();
  }
  console.log(
    `🗑️ ${color.green('Deletion successful!')} Environment ${color.blue(targetEnvironment)} has been deleted.`,
  );
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
