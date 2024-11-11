// example use of custom fonts. Replace these with your own fonts:
import archivo400url from '@fontsource/archivo/files/archivo-latin-400-normal.woff2?url';
import archivo600url from '@fontsource/archivo/files/archivo-latin-600-normal.woff2?url';
// urls above only resolve corrently in production, so we use the following for local development:
import '@fontsource/archivo/latin-400.css';
import '@fontsource/archivo/latin-600.css';

export type Font = {
  family: string;
  weight: number;
  style: string;
  woff2Url: string;
}

export const fontFamilyArchivo = 'Archivo, sans-serif';

export const fonts: Font[] = [
  {
    family: 'Archivo',
    weight: 400,
    style: 'normal',
    woff2Url: archivo400url,
  },
  {
    family: 'Archivo',
    weight: 600,
    style: 'normal',
    woff2Url: archivo600url,
  },
];

export const getFontCss = (font: Font) => {
  return /* css */`
    @font-face {
      font-family: '${font.family}';
      font-style: ${font.style};
      font-weight: ${font.weight};
      src: url('${font.woff2Url}') format('woff2');
    }
  `;
};
