// example use of custom fonts. Replace these with your own fonts:
import archivo400url from '@fontsource/archivo/files/archivo-latin-400-normal.woff2?url';
import archivo600url from '@fontsource/archivo/files/archivo-latin-600-normal.woff2?url';

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

export const getFontFaceDeclaration = (font: Font) => {
  return /* css */`
    @font-face {
      font-family: '${font.family}';
      font-style: ${font.style};
      font-weight: ${font.weight};
      src: url('${font.woff2Url}') format('woff2');
    }
  `;
};
