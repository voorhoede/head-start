import { cancelByUser, execCommandStrict } from './lib/exec-command';
import {
  getPrimaryEnvironment,
  getTargetSandBoxEnvironment,
  updateLocalEnvironment,
} from './lib/environments';
import { getProjectName } from './lib/projects';
import { color } from './lib/color';
import { stripIndents } from 'proper-tags';
import confirm from '@inquirer/confirm';
import { getDeleteConfirmationMessage } from './cms-destroy-environment';

// ============================================================================
// MAINTENANCE MODE OPERATIONS
// ============================================================================

const turnOnMaintenanceMode = async (projectName: string) => {
  const logMessage = `🔧 Turning on maintenance mode for project ${color.yellow(projectName)}`;
  await execCommandStrict(
    `npx datocms maintenance:on --api-token=${process.env.DATOCMS_API_TOKEN}`,
    logMessage,
  );
};

const turnOffMaintenanceMode = async (projectName: string) => {
  const logMessage = `🔧 Turning off maintenance mode for project ${color.yellow(projectName)}`;
  await execCommandStrict(
    `npx datocms maintenance:off --api-token=${process.env.DATOCMS_API_TOKEN}`,
    logMessage,
  );
};

// ============================================================================
// ENVIRONMENT OPERATIONS
// ============================================================================

const promoteEnvironment = async (targetEnvironment: string) => {
  const logMessage = `🚀 Promoting environment ${color.blue(targetEnvironment)} to primary`;
  await execCommandStrict(
    `npx datocms environments:promote ${targetEnvironment} --api-token=${process.env.DATOCMS_API_TOKEN}`,
    logMessage,
  );
};

const createNewEnvironment = async (targetEnvironment: string) => {
  const logMessage = `✨ Creating new sandbox environment '${targetEnvironment}'
    ${color.green('New migration files will be run in chronological order')}.
  `;
  await execCommandStrict(
    `npx datocms migrations:run --destination=${targetEnvironment} --api-token=${process.env.DATOCMS_API_TOKEN}`,
    logMessage,
  );
};

const deleteEnvironment = async (environmentName: string) => {
  const logMessage = `🗑️  Deleting environment '${color.blue(environmentName)}'`;
  await execCommandStrict(
    `npx datocms environments:destroy ${environmentName} --api-token=${process.env.DATOCMS_API_TOKEN}`,
    logMessage,
  );
};

// ============================================================================
// USER INTERACTION FUNCTIONS
// ============================================================================

const askForConfirmationPromoteEnvironment = async (
  targetEnvironment: string,
  primaryEnvironment: string,
) => {
  const confirmationMessage = stripIndents`
    Promote the environment ${color.blue(targetEnvironment)} to primary instead of the current primary environment ${color.blue(primaryEnvironment)}`;
  const allow = await confirm({
    message: `⚠️ ${confirmationMessage}\n\nAre you sure you want to continue?`,
    default: false,
  });
  return allow;
};

const askForNewEnvironment = async (targetEnvironment: string) => {
  const isCreateEnv = await confirm({
    message: `Do you want to create the environment ${color.blue(targetEnvironment)} first?`,
    default: false,
  });
  
  if (isCreateEnv) {
    console.log(`Creating new environment ${color.blue(targetEnvironment)}`);
    await createNewEnvironment(targetEnvironment);
    await updateLocalEnvironment(targetEnvironment);
  }
};

const askForDeleteOldEnvironment = async (
  formerPrimaryEnvironment: string,
) => {
  const isDeleteOldEnv = await confirm({
    message: 'Do you want to delete the old primary environment ?',
    default: false,
  });
  
  if (isDeleteOldEnv) {
    const confirmationMessage = await getDeleteConfirmationMessage(formerPrimaryEnvironment);
    const allow = await confirm({
      message: `⚠️ ${confirmationMessage}\n\nAre you sure you want to continue?`,
      default: false,
    });
    if (allow) {
      await deleteEnvironment(formerPrimaryEnvironment);
    }
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

const handleError = async (error: unknown) => {
  console.error(
    '❌ Error occured while promoting environment .',
  );
  console.warn(
    '⚠️ Please check the project and turn off maintenance mode manually.',
  );
  console.error(error);
  console.error('🛑 Stopping execution due to error');
  process.exit(1);
};

// ============================================================================
// MAIN EXECUTION FLOW
// ============================================================================

export default async function run() {

  try {
    // Step 1: Get environment information
    const projectName = await getProjectName();
    const formerPrimaryEnvironment = await getPrimaryEnvironment();
    const targetEnvironment = await getTargetSandBoxEnvironment();

    // Step 2: Optionally create new environment
    await askForNewEnvironment(targetEnvironment);

    // Step 3: Confirm promotion
    const allow = await askForConfirmationPromoteEnvironment(targetEnvironment, formerPrimaryEnvironment);

    if (!allow) {
      await cancelByUser();
      return;
    }

    // Step 4: Execute promotion with maintenance mode
    await turnOnMaintenanceMode(projectName);
    await promoteEnvironment(targetEnvironment);
    await updateLocalEnvironment(targetEnvironment);
    await turnOffMaintenanceMode(projectName);

    // Step 5: Optionally delete old environment
    await askForDeleteOldEnvironment(formerPrimaryEnvironment);

    // Step 6: Success message
    console.log(
      `🎉 ${color.green('Promotion successful!')} The environment ${color.blue(targetEnvironment)} is now the primary environment.`,
    );
  } catch (error) {
    await handleError(error);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
