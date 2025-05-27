import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

const confirmationMessage = `Apply all migrations in chronological order to the environment '${datocmsEnvironment}'`;
execCommand(
  `npx datocms migrations:run --destination=${datocmsEnvironment} --fast-fork`,
  confirmationMessage,
);
