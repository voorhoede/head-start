import { exec } from 'node:child_process';
import { promisify } from 'node:util';

export const execCommand = async (command: string) => {
  const execAsync = promisify(exec);
  try {
    const { stdout } = await execAsync(command);
    console.log(stdout);
  } catch (error) {
    console.error(error);
  }
};
