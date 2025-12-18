import { cancelByUser, catchError, execCommandStrict, getExecConfirmationMessage } from './lib/exec-command';
import {
  getPrimaryEnvironment,
  getTargetSandBoxEnvironment,
  updateLocalEnvironment,
} from './lib/environments';
import { getProjectName } from './lib/projects';
import { color } from './lib/color';
import { stripIndents } from 'proper-tags';
import confirm from '@inquirer/confirm';
import { deleteSandboxEnvironment } from './cms-destroy-environment';

// ============================================================================
// MAINTENANCE MODE OPERATIONS
// ============================================================================

const turnOnMaintenanceMode = async (projectName: string) => {
  const logMessage = `🔧 Turning on maintenance mode for project ${color.yellow(projectName)}`;
  await execCommandStrict('npx datocms maintenance:on', logMessage);
};

const turnOffMaintenanceMode = async (projectName: string) => {
  const logMessage = `🔧 Turning off maintenance mode for project ${color.yellow(projectName)}`;
  await execCommandStrict('npx datocms maintenance:off ', logMessage);
};

// ============================================================================
// ENVIRONMENT OPERATIONS
// ============================================================================

const promoteEnvironment = async (targetEnvironment: string) => {
  const logMessage = `🚀 Promoting environment ${color.blue(targetEnvironment)} to primary`;
  await execCommandStrict(
    `npx datocms environments:promote ${targetEnvironment}`,
    logMessage,
  );
};

// ============================================================================
// USER INTERACTION FUNCTIONS
// ============================================================================

const askConfirmationDeleteOldPrimaryEnvironment = async (environmentName: string) => {
  const allow = await confirm({
    message: stripIndents`
      Do you want to delete the old primary environment ${color.blue(environmentName)}?`,
    default: false,
  });
  return allow;
};

const askForConfirmationPromoteEnvironment = async (
  targetEnvironment: string,
  primaryEnvironment: string,
) => {
  const confirmationMessage = stripIndents`
    Promote the environment ${color.blue(targetEnvironment)} to primary instead of the current primary environment ${color.blue(primaryEnvironment)}`;
  const allow = await confirm(getExecConfirmationMessage(confirmationMessage));
  return allow;
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

const handleError = async (error: unknown) => {
  console.error('❌ Error occured while promoting environment .');
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

    // Step 2: Confirm promotion
    const allow = await askForConfirmationPromoteEnvironment(
      targetEnvironment,
      formerPrimaryEnvironment,
    );

    if (!allow) {
      await cancelByUser();
      return;
    }

    // Step 3: Execute promotion with maintenance mode
    await turnOnMaintenanceMode(projectName);
    await promoteEnvironment(targetEnvironment);
    await updateLocalEnvironment(targetEnvironment);
    await turnOffMaintenanceMode(projectName);

    // Step 4: Optionally delete old environment
    const isDeleteOldEnv = await askConfirmationDeleteOldPrimaryEnvironment(
      formerPrimaryEnvironment,
    );
    if (isDeleteOldEnv) {
      await deleteSandboxEnvironment(formerPrimaryEnvironment, true);
    }

    // Step 5: Success message
    console.log(
      `🎉 ${color.green('Promotion successful!')} The environment ${color.blue(targetEnvironment)} is now the primary environment.`,
    );
  } catch (error) {
    await handleError(error);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(catchError);
}
