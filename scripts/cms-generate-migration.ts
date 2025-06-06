import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';
import { stripIndents } from 'proper-tags';

const confirmationMessage = stripIndents`
  Create a new migration in 'config/datocms/migrations' based on the 
  differences between the primary environment and environment '${datocmsEnvironment}'`;

execCommand(
  `npx datocms migrations:new --autogenerate=${datocmsEnvironment} ${datocmsEnvironment}`,
  confirmationMessage,
);
