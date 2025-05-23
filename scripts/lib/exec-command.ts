import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import inquirer from 'inquirer';

const confirm = async (confirmationMessage?: string) => {
  if (!confirmationMessage) {
    return true;
  }

  const confirmationFromUser: { confirm: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `⚠️ ${confirmationMessage}\n\nAre you sure you want to continue?`,
      default: false,
    },
  ]);
  return confirmationFromUser.confirm;
};

export const execCommand = async (
  command: string,
  confirmationMessage?: string,
) => {
  const isConfirmed = await confirm(confirmationMessage);

  if (isConfirmed) {
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
