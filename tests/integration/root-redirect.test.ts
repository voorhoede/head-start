import { describe, expect, inject, test } from 'vitest';
import { JSDOM } from 'jsdom';
import { cookieName, defaultLocale, locales } from '@lib/i18n';

const fetchRoute = async (route: string, options?: RequestInit) => {
  return fetch(new URL(route, inject('baseUrl')), options);
};

const responseToDocument = async (response: Response) => {
  const html = await response.text();
  const { document } = new JSDOM(html).window;
  return document;
};

const routeUrl = (route: string) => {
  return new URL(route, inject('baseUrl')).toString();
};

describe('Root index file (`/`)', () => {
  test('should redirect to home page in default locale', async () => {
    const response = await fetchRoute('/');
    expect(response.redirected).toBe(true);
    expect(response.status).toBe(200);
    expect(response.url).toBe(routeUrl(`/${defaultLocale}/`));
    const document = await responseToDocument(response);
    expect(document.documentElement.lang).toBe(defaultLocale);
  });

  test('should redirect to home page in user locale, based on accept language header', async () => {
    [locales].forEach(async (locale) => {
      const response = await fetchRoute('/', {
        headers: {
          'Accept-Language': String(locale),
        },
      });
      expect(response.redirected).toBe(true);
      expect(response.status).toBe(200);
      expect(response.url).toBe(routeUrl(`/${defaultLocale}/`));
      const document = await responseToDocument(response);
      expect(document.documentElement.lang).toBe(locale);
    });
  });

  test('should redirect to home page in user locale, based on cookie', async () => {
    [locales].forEach(async (locale) => {
      const response = await fetchRoute('/', {
        headers: {
          cookie: `${cookieName}=${locale}`,
        },
      });
      expect(response.redirected).toBe(true);
      expect(response.status).toBe(200);
      expect(response.url).toBe(routeUrl(`/${defaultLocale}/`));
      const document = await responseToDocument(response);
      expect(document.documentElement.lang).toBe(locale);
    });
  });

});
