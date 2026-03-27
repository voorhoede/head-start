import { describe, expect, test, vi } from 'vitest';
import type { PageRouteFragment, SiteLocale } from '@lib/datocms/types';
import { getLocalizedSlug, getRecordLocale, getSlugFromPath } from './slug';
import { defaultLocale } from '@lib/i18n';

vi.mock('@lib/i18n', async () => {
  const actual = await vi.importActual('@lib/i18n');
  return {
    ...actual,
    defaultLocale: 'en' as SiteLocale,
  };
});

const mockLocales = ['en', 'nl'] as SiteLocale[];

const pageSlugs = {
  en: 'example-page',
  nl: 'voorbeeld-pagina'
} as Record<string, string> as Record<SiteLocale, string>; // type assertion so test locales can be different from project locales.

const record: PageRouteFragment = {
  __typename: 'PageRecord',
  id: '123',
  title: 'Example Page',
  slug: '',
  _allSlugLocales: mockLocales.map(
    (locale) => ({ locale, value: pageSlugs[locale] })
  ),
};

const localizedRecords = mockLocales.map((locale) => ({
  ...record,
  slug: pageSlugs[locale],
}));


const enOnlyRecord: PageRouteFragment = {
  ...record,
  slug: 'example-page',
  _allSlugLocales: [{
    locale: mockLocales[0],
    value: pageSlugs[mockLocales[0]],
  }],
};

describe('getLocalizedSlug', () => {
  test('returns slug in specific locale href for a given page record', () => {
    mockLocales.forEach(locale => {
      const slug = getLocalizedSlug({ locale, record });
      expect(slug).toBe(pageSlugs[locale]);
    });
  });
});

describe('getRecordLocale', () => {
  test('returns requested locale for fully localized record', () => {
    mockLocales.forEach((locale, i) => {
      const recordLocale = getRecordLocale({ locale, record: localizedRecords[i] });
      expect(recordLocale).toBe(locale);
    });
  });
  
  test('returns best matching locale for record with missing locale', () => {
    mockLocales.forEach(locale => {
      const recordLocale = getRecordLocale({ locale, record: enOnlyRecord });
      expect(recordLocale).toBe(defaultLocale);
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
