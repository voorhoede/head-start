import fs from 'node:fs/promises';
import path from 'node:path';

async function writeIconNameTypes() {
  const iconFiles = await fs.readdir('./src/assets/icons/');
  const iconNames = iconFiles
    .filter(file => file.endsWith('.svg'))
    .map(file => path.basename(file, '.svg'));

  await fs.writeFile('./src/assets/icon-sprite.ts', 
    `export const iconNames = [${iconNames.map(name => `'${name}'`)}] as const;\n` +
    'export type IconName = typeof iconNames[number];'
  );
}

writeIconNameTypes()
  .then(() => console.log('Icon names written to src/assets/icon-sprite.ts'));
