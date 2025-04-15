import { describe, expect, test, vi } from 'vitest';
import type { FileRouteFragment, HomeRouteFragment, PageRouteFragment, SiteLocale } from '@lib/datocms/types';
import { datocmsAssetsOrigin } from '@lib/datocms';
import { getHref, getFileHref, getHomeHref, getPageHref } from './index';

vi.mock('@lib/datocms', () => ({
  datocmsAssetsOrigin: 'https://www.datocms-assets.com/',
}));

vi.mock('@lib/i18n', () => ({
  getLocale: () => 'en',
}));

const fileRecord: FileRouteFragment = { 
  __typename: 'FileRecord',
  id: '123',
  title: 'example.pdf',
  file: { 
    basename: 'example.pdf',
    filename: 'example.pdf',
    format: 'pdf',
    mimeType: 'application/pdf',
    size: 123456,
    url: new URL('/path/to/example.pdf', datocmsAssetsOrigin).toString(),
  },
};

const homeRecord: HomeRouteFragment = { 
  __typename: 'HomePageRecord',
  id: 'home',
  title: 'Home'
};

const pageRecord: PageRouteFragment = {
  __typename: 'PageRecord',
  id: '123',
  title: 'Example Page',
  slug: 'example-page',
  _allSlugLocales: [{ locale: 'en' as SiteLocale, value: 'example-page' }],
};

describe('getFileHref', () => {
  test('returns relative (/files/:filename) href for a given file record', () => {
    const href = getFileHref(fileRecord);
    expect(href).toBe('/files/path/to/example.pdf');
  });
});

describe('getHomeHref', () => {
  test('returns the home href for a given locale', () => {
    expect(getHomeHref({ locale: 'en' })).toBe('/en/');
    expect(getHomeHref({ locale: 'nl' })).toBe('/nl/');
  });

  test('returns the home href for current locale if no locale is provided', () => {
    expect(getHomeHref()).toBe('/en/');
  });

  test('returns href with trailing slash', () => {
    expect(getHomeHref()).toMatch(/\/$/);
  });
});

describe('getPageHref', () => {
  const locale = 'en' as SiteLocale;
  test('returns the page href for a given locale and page record', () => {
    expect(getPageHref({ locale, record: pageRecord })).toBe('/en/example-page/');
  });

  test('returns href with trailing slash', () => {
    expect(getPageHref({ locale, record: pageRecord })).toMatch(/\/$/);
  });

  const nestedRecord: PageRouteFragment = {
    __typename: 'PageRecord',
    id: '123',
    title: 'Nested Page',
    slug: 'nested-page',
    _allSlugLocales: [{ locale, value: 'nested-page' }],
    parentPage: {
      __typename: 'PageRecord',
      id: '456',
      title: 'Parent Page',
      slug: 'parent-page',
      _allSlugLocales: [{ locale, value: 'parent-page' }],
    },
  };

  test('returns the full page href for a nested page record', () => {
    expect(getPageHref({ locale, record: nestedRecord })).toBe('/en/parent-page/nested-page/');
  });
});

describe('getHref', () => {
  const locale = 'en' as SiteLocale;

  test('returns file href for a FileRecord', () => {
    expect(getHref({ locale, record: fileRecord })).toBe('/files/path/to/example.pdf');
  });

  test('returns home href for a HomeRecord', () => {
    expect(getHref({ locale, record: homeRecord })).toBe('/en/');
  });

  test('returns page href for a PageRecord', () => {
    expect(getHref({ locale, record: pageRecord })).toBe('/en/example-page/');
  });
});
