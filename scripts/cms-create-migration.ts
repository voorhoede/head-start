import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

const confirmationMessage = `create a new migration script in 'config/datocms/migrations' based on the differences between the environment '${datocmsEnvironment}' and the primary environment.`;

execCommand(
  `npx datocms migrations:new --autogenerate=${datocmsEnvironment} ${datocmsEnvironment}`,
  confirmationMessage,
);
