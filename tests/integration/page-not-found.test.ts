import { describe, expect, inject, test } from 'vitest';
import { JSDOM } from 'jsdom';
import { defaultLocale, locales } from '@lib/i18n';

const fetchRoute = async (route: string, options?: RequestInit) => {
  return fetch(new URL(route, inject('baseUrl')), options);
};

const responseToDocument = async (response: Response) => {
  const html = await response.text();
  const { document } = new JSDOM(html).window;
  return document;
};

describe('Page not found:', () => {
  test('unmatched routes without matching locale, should return 404 page in default locale', async () => {
    const response = await fetchRoute('/unmatched-route');
    expect(response.status).toBe(404);
    const document = await responseToDocument(response);
    expect(document.documentElement.lang).toBe(defaultLocale);
  });

  test('unmatched routes with matching locale, should return 404 page in given locale', async () => {
    [locales].forEach(async (locale) => {
      const response = await fetchRoute(`/${locale}/unmatched-route`);
      expect(response.status).toBe(404);
      const document = await responseToDocument(response);
      expect(document.documentElement.lang).toBe(locale);
    });
  });
});
