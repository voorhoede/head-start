import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import confirm from '@inquirer/confirm';

export const execCommand = async (
  command: string,
  confirmationMessage?: string,
) => {
  const allow = confirmationMessage
    ? await confirm({
      message: `⚠️ ${confirmationMessage}\n\nAre you sure you want to continue?`,
      default: false,
    })
    : true; // default to true if no confirmation message is provided

  if (allow) {
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync(command);
      console.log(stdout);
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log('execution cancelled');
  }
};
