import { catchError, execCommandSafe } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';
import { getTargetSandBoxEnvironment } from './lib/environments';
import { color } from './lib/color';

const confirmationMessage = `Apply all migrations in chronological order to the environment ${color.blue(datocmsEnvironment)}`;

export default async function run() {
  const targetEnvironment = await getTargetSandBoxEnvironment();
  const isSynced = await execCommandSafe(
    `npx datocms migrations:run --source=${targetEnvironment} --in-place`,
    confirmationMessage,
  );
  if (isSynced) {
    console.log(
      `🔄  ${color.green('Sync successful!')} Environment ${color.blue(targetEnvironment)} has been synced.`,
    );
  } else {
    console.log(
      `🔄  ${color.red('Sync failed!')} Environment ${color.blue(targetEnvironment)} has not been synced.`,
    );
  }
}


// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(catchError);
}
