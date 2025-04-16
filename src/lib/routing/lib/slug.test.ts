import { describe, expect, test } from 'vitest';
import type { PageRouteFragment, SiteLocale } from '@lib/datocms/types';
import { getLocalizedSlug, getSlugFromPath } from './slug';

const mockLocales = ['en', 'nl'] as SiteLocale[];
const pageSlugs = {
  en: 'example-page',
  nl: 'voorbeeld-pagina'
} as Record<string, string> as Record<SiteLocale, string>; // type assertion so test locales can be different from project locales.

const record: PageRouteFragment = {
  __typename: 'PageRecord',
  id: '123',
  title: 'Example Page',
  slug: 'example-page',
  _allSlugLocales: mockLocales.map(
    (locale) => ({ locale, value: pageSlugs[locale] })
  )
};

describe('getLocalizedSlug', () => {
  test('returns slug in specific locale href for a given page record', () => {
    mockLocales.forEach(locale => {
      const slug = getLocalizedSlug({ locale, record });
      expect(slug).toBe(pageSlugs[locale]);
    });
  });
});

describe('getSlugFromPath', () => {
  const paths = [
    '/page-1',
    '/page-1/',
    '/page-1/?foo=bar',
    '/grand-parent/parent-slug/page-1',
  ];
  
  test('returns slug from path regardless of depth', () => {
    paths.forEach(path => {
      const slug = getSlugFromPath(path);
      expect(slug).toBe('page-1');
    });
  });
  
  test('returns undefined when path is root', () => {
    const slug = getSlugFromPath('/');
    expect(slug).toBe(undefined);
  });
  
  test('ignores duplicate slashes', () => {
    paths.map(path => `${path}//`).forEach(path => {
      const slug = getSlugFromPath(path);
      expect(slug).toBe('page-1');
    });
  });
});
