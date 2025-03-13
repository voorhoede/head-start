import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

execCommand(`npx datocms migrations:run --destination=${datocmsEnvironment} --fast-fork`);
