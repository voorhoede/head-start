import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import inquirer from 'inquirer';

// npx datocms environments:fork grouping-block test-migration --fast

export const execCommand = async (
  command: string,
  confirmationMessage: string,
) => {
  const isConfirmed: { confirm: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `⚠️  ${confirmationMessage}\n\nAre you sure you want to continue?`,
      default: false,
      theme: {
        prefix: 'This command will: \n',
      },
    },
  ]);
  if (isConfirmed.confirm) {
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
