import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

const confirmationMessage = `Promote the environment '${datocmsEnvironment}' to the primary environment`;

execCommand(
  `npx datocms environments:promote ${datocmsEnvironment}`,
  confirmationMessage,
);
