// // example use of custom fonts. Modify fontsConfig with your own fonts.
// Based on https://docs.astro.build/en/guides/fonts/

// @note still experimental in in this version of Astro,
// its stable in astro v5.7 and gets improvements in v6.0

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