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
async function create404Pages() {
  return globby(path.join(__dirname, '../dist/**/404/index.html'))
    .then(async filepaths => {
      return filepaths.map(async filepath => {
        const content = await readFile(filepath, 'utf8');
        const notFoundPath = filepath.replace('404/index.html', '404.html');

        // create new file and remove old one
        return Promise.all([
          writeFile(notFoundPath, content, 'utf8'),
          unlink(filepath)
        ]);
      });
    });
}

create404Pages()
  .then(() => console.log('Created 404 pages'));
