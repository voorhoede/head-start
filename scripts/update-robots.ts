import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile, readFile } from 'node:fs/promises';
import { siteUrl } from '../astro.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const robotsFilename= path.join(__dirname, '../dist/robots.txt');

async function updateRobots() {
  const robotsTxt = await readFile(robotsFilename);
  const sitemapsRule = `Sitemap: ${siteUrl}/sitemap-index.xml`;
  await writeFile(robotsFilename, [
    robotsTxt,
    sitemapsRule,
  ].join('\n\n'));
  console.log('🤖 added Sitemap rule to robots.txt');
}

updateRobots();
