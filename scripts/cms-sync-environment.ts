import { execCommandSafe } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

const confirmationMessage = `Apply all migrations in chronological order to the environment '${datocmsEnvironment}'`;

export default async function run() {
  execCommandSafe(
    `npx datocms migrations:run --source=${datocmsEnvironment} --in-place`,
    confirmationMessage,
  );
}


// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

