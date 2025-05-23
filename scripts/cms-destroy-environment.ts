import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

const confirmationMessage = `destroy the environment '${datocmsEnvironment}'`;

execCommand(
  `npx datocms environments:destroy ${datocmsEnvironment}`,
  confirmationMessage,
);
