import { execSync } from 'node:child_process';
import dotenv from 'dotenv-safe';
import { notifyDatocms } from './lib/notify-datocms.ts';

dotenv.config();

const command = 'npm run build';

async function build() {
  try {
    execSync(command, { stdio: 'inherit' });
    // A successful build is not reported to DatoCMS yet:
    // `scripts/deploy.ts` reports the result once the deploy has run.
  } catch (error) {
    await notifyDatocms({ status: 'error' });
    console.error(error);
    process.exit(1);
  }
}

build();
