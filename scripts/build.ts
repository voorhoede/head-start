import { execSync } from 'node:child_process';
import minimist from 'minimist';
import { isPreview } from '../config/preview';

function build() {
  const { command } = minimist(process.argv.slice(2)) as { command?: string };
  if (!command) {
    throw new Error('`--command` is required');
  }

  console.log('PREVIEW MODE?', isPreview);

  try {
    execSync(command, { 
      env: {
        ...process.env,
        HEAD_START_PREVIEW: isPreview ? 'true' : 'false',
      },
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

build();
