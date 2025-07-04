import { catchError, execCommandSafe } from './lib/exec-command';
import { stripIndents } from 'proper-tags';
import { getPrimaryEnvironment, getTargetSandBoxEnvironment } from './lib/environments';
import { color } from './lib/color';

const getConfirmationMessage = async (targetEnvironment: string, sourceEnvironment: string) => {

  return stripIndents`
    📝 Create a new migration in ${color.yellow('config/datocms/migrations')} based on the 
    differences between the primary environment ${color.blue(sourceEnvironment)} and environment ${color.blue(targetEnvironment)}`;
};

export default async function run() {
  const targetEnvironment = await getTargetSandBoxEnvironment();
  const sourceEnvironment = await getPrimaryEnvironment();
  const confirmationMessage = await getConfirmationMessage(targetEnvironment, sourceEnvironment);

  await execCommandSafe(
    `npx datocms migrations:new --autogenerate=${targetEnvironment} ${targetEnvironment}`,
    confirmationMessage,
  );
  console.log(
    `📝 ${color.green('Migration generation successful!')} New migration file has been created in ${color.yellow('config/datocms/migrations')}.`,
  );
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(catchError);
}
