import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputFilename = resolve(__dirname, '../src/lib/seo/ai.robots.txt');

interface Asset {
  name: string;
  browser_download_url: string;
}

async function downloadLatestRobotsTxt() {
  const release = await fetch(
    'https://api.github.com/repos/ai-robots-txt/ai.robots.txt/releases/latest',
    { headers: { 'User-Agent': 'Node.js' } }
  ).then(res => res.json());

  const robotsTxtAsset = release.assets.find((asset: Asset) => asset.name === 'robots.txt');

  if (!robotsTxtAsset) {
    throw new Error('robots.txt not found in latest release');
  }

  const content = await fetch(robotsTxtAsset.browser_download_url).then(res => res.text());
  await writeFile(outputFilename, content);
  
  return {
    outputFilename,
    release,
  };
}

downloadLatestRobotsTxt()
  .then(({ outputFilename, release }) => {
    console.log(`✅ Downloaded ai.robots.txt ${release.tag_name} to ${outputFilename}`);
  });
