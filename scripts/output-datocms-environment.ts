import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getEnvironment } from './lib/datocms';

(async () => {
  const environment = await getEnvironment();
  await writeFile(path.join(__dirname, '../datocms-environment.json'), JSON.stringify({ environment }, null, 2));
})();
