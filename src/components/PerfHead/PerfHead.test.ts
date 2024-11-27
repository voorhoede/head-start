import { describe, expect, test, } from 'vitest';
import { renderToFragment } from '@lib/renderer';
import PerfHead from './PerfHead.astro';


describe('PerfHead', async () => {
  const fragment = await renderToFragment(PerfHead, { props: {} });

  test('pre-connects to origins to speed up following requests', () => {
    const links = fragment.querySelectorAll('link[rel="preconnect"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => {
      // expect link's href to be a valid absolute URL:
      const url = new URL(String(link.getAttribute('href')));
      expect(url.protocol).toMatch(/https?/);
    });
  });

  test('preloads font files for faster font loading and page rendering', () => {
    const links = fragment.querySelectorAll('link[rel="preload"][as="font"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => {
      expect(link.getAttribute('type')).toBe('font/woff2');
      expect(link.getAttribute('href')).toMatch(/\.woff2$/);
      expect(link.getAttribute('crossorigin')).toBe('anonymous');
    });
  });

  test('inlines font declarations as critical CSS', () => {
    const styleText = fragment.querySelector('style')?.textContent ?? '';
    const fontFaceDeclarations = styleText.match(/@font-face\s*{[^}]*}/g) ?? [];
    expect(fontFaceDeclarations.length).toBeGreaterThanOrEqual(1);
    fontFaceDeclarations.forEach((declaration) => {
      // replace HTML entities with their character equivalents:
      const cleanedDeclaration = declaration.replace(/&#39;/g, '\''); 
      // expect font-face declaration to contain woff2 src url:
      expect(cleanedDeclaration).toMatch(/src\s*:\s*url\('.*\.woff2'\)\s*format\('woff2'\)/);
    });
  });
});
