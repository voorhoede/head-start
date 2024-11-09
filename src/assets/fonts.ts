import archivo400css from '@fontsource/archivo/latin-400.css?raw'; // works in production
import archivo600css from '@fontsource/archivo/latin-600.css?raw';
import archivo400url from '@fontsource/archivo/files/archivo-latin-400-normal.woff2?url';
import archivo600url from '@fontsource/archivo/files/archivo-latin-600-normal.woff2?url';
import '@fontsource/archivo/latin-400.css'; // works local development
import '@fontsource/archivo/latin-600.css';

export const fontFamilyArchivo = 'Archivo, Times New Roman';
export const fontCssDeclarations = [archivo400css, archivo600css];
export const woff2urls = [archivo400url, archivo600url];
