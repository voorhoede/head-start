// // example use of custom fonts. Modify fontsConfig with your own fonts.
// Based on https://docs.astro.build/en/guides/fonts/

import { fontProviders, type FontFamily } from 'astro/config';

export const fontConfig: FontFamily[] = [
  {
    name: 'Archivo',
    cssVariable: '--font-archivo',
    provider: fontProviders.fontsource(),
    weights: [400, 600],
    styles: ['normal'],
  }
];