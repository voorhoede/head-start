import { execCommand } from './lib/exec-command';
import { datocmsEnvironment } from '../datocms-environment';

execCommand(`npx datocms environments:promote ${datocmsEnvironment}`);
