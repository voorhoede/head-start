import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { writeFile, readFile, unlink } from 'node:fs/promises';
import { globby } from 'globby';
import { defaultLocale } from '../src/lib/i18n';


/**
 * Rewrite localised "/:locale/404/index.html" to "/:locale/404.html" so Cloudflare picks them up automatically.
 * Create a default 404 page, i.e. "/404.html" from the default locale.
 * See https://developers.cloudflare.com/pages/platform/serving-pages/#not-found-behavior
 */
async function move404Pages() {
  // create fallback 404 page from default locale
  const defaultLocale404Page = await readFile(path.join(__dirname, `../dist/${defaultLocale}/404/index.html`));
  await writeFile(path.join(__dirname, '../dist/404.html'), defaultLocale404Page);
  
  // rewrite localised 404 pages
  const filepaths = await globby(path.join(__dirname, '../dist/**/404/index.html'));
  return filepaths.map(filepath => {
    return moveFile(filepath, filepath.replace('404/index.html', '404.html'));
  });
}

async function moveFile(filepath: string, newFilepath: string ) {
  const content = await readFile(filepath, 'utf8');

  // create new file and remove old one
  await writeFile(newFilepath, content, 'utf8');
  await unlink(filepath);
}

move404Pages()
  .then(() => console.log('Created 404 pages'));
