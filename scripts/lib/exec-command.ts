import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import confirm from '@inquirer/confirm';

export const execAsync = promisify(exec);

// No error handling inside function to allow error propagation
export const execCommandStrict = async (
  command: string,
  logMessage?: string,
) => {
  if (logMessage) {
    console.log(logMessage);
  }
  const { stdout } = await execAsync(command);
  console.log(stdout);
};

export const getExecConfirmationMessage = (message: string) => {
  return {
    message: `${message}\n\nAre you sure you want to continue?`,
    default: false,
  };
};

// Error handling inside function
export const execCommandSafe = async (
  command: string,
  confirmationMessage?: string,
): Promise<boolean> => {
  const allow = confirmationMessage
    ? await confirm(getExecConfirmationMessage(confirmationMessage))
    : true; // default to true if no confirmation message is provided

  let hasSucceeded = false;
  if (allow) {
    try {
      await execCommandStrict(command);
      hasSucceeded = true;
    } catch (error) {
      console.error(error);
    }
  } else {
    await cancelByUser();
  }
  return hasSucceeded;
};

export const cancelByUser = async () => {
  console.log('🚫 Operation cancelled by user');
  process.exit(1);
};

export const catchError = (error: unknown) => {
  if ((error as Error)?.name === 'ExitPromptError') {
    cancelByUser();
  } else {
    console.error(error);
    process.exit(1);
  }
};
