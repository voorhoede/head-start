import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

const confirmationMessage = `Apply all migrations in chronological order to the environment '${datocmsEnvironment}'`;
export default async function run() {
  execCommand(
    `npx datocms migrations:run --source=${datocmsEnvironment} --in-place`,
    confirmationMessage,
  );
}

run();
