import fs from 'node:fs/promises';
import path from 'node:path';
import glob from 'tiny-glob';

/**
 * Astro writes all *.md.astro files to *.md/index.html files.
 * So we need to rename them back to *.md files:
 */
const renameMdFiles = async () => {
  const filenames = await glob('dist/**/*.md/index.html');

  for (const filename of filenames) {
    const file = await fs.readFile(filename, 'utf-8');
    const dirName = path.dirname(filename);
    await fs.rm(dirName, { recursive: true });
    const newFilename = filename.replace(/\.md\/index\.html$/, '.md');
    await fs.writeFile(newFilename, file);
  }

  return filenames.length;
};

renameMdFiles().then((count) => console.log(`✅ Renamed ${count} markdown files to '*.md'.`));
