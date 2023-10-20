import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { writeFile, readFile, unlink } from 'node:fs/promises';
import { globby } from 'globby';

/**
 * Rewrite localised "/:locale/404/index.html" to "/:locale/404.html" so Cloudflare picks them up automatically.
 * See https://developers.cloudflare.com/pages/platform/serving-pages/#not-found-behavior
 */
async function move404Pages() {
  return globby(path.join(__dirname, '../dist/**/404/index.html'))
    .then(async filepaths => {
      return filepaths.map(filepath => {
        return moveFile(filepath, filepath.replace('404/index.html', '404.html'));
      });
    });
}

async function moveFile(filepath, newFilepath) {
  const content = await readFile(filepath, 'utf8');

  // create new file and remove old one
  return Promise.all([
    writeFile(newFilepath, content, 'utf8'),
    unlink(filepath)
  ]);
}

move404Pages()
  .then(() => console.log('Created 404 pages'));
