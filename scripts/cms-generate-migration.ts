import { execCommandSafe } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';
import { stripIndents } from 'proper-tags';
import { getPrimaryEnvironment, getTargetSandBoxEnvironment, updateLocalEnvironment } from './lib/environments';
import { color } from './lib/color';

const confirmationMessage = stripIndents`
  Create a new migration in 'config/datocms/migrations' based on the 
  differences between the primary environment and environment '${datocmsEnvironment}'`;

execCommandSafe(
  `npx datocms migrations:new --autogenerate=${datocmsEnvironment} ${datocmsEnvironment}`,
  confirmationMessage,
);

const getConfirmationMessage = async (targetEnvironment: string, sourceEnvironment: string) => {

  return stripIndents`
    Create a new migration in 'config/datocms/migrations' based on the 
    differences between the primary environment '${sourceEnvironment}' and environment '${color.blue(targetEnvironment)}'`;
};

export default async function run() {
  const targetEnvironment = await getTargetSandBoxEnvironment();
  const sourceEnvironment = await getPrimaryEnvironment();
  const confirmationMessage = await getConfirmationMessage(targetEnvironment, sourceEnvironment);

  const result = await execCommandSafe(
    `npx datocms migrations:new --autogenerate=${targetEnvironment} ${sourceEnvironment}`,
    confirmationMessage,
  );

  if(result) {
    await updateLocalEnvironment(targetEnvironment);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
