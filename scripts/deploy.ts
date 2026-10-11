import { execSync } from 'node:child_process';
import dotenv from 'dotenv-safe';
import { notifyDatocms } from './lib/notify-datocms.ts';

dotenv.config();

// The Cloudflare Vite plugin already selected the Wrangler environment
// (`CLOUDFLARE_ENV`, see wrangler.toml) during the build, so a plain
// `wrangler deploy` targets the right Worker for production and preview.
const command = 'wrangler deploy';

async function deploy() {
  try {
    execSync(command, { stdio: 'inherit' });
    await notifyDatocms({ status: 'success' });
  } catch (error) {
    await notifyDatocms({ status: 'error' });
    console.error(error);
    process.exit(1);
  }
}

deploy();
