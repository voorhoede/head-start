import { describe, expect, test, vi } from 'vitest';
import Collection from './index';

const { loadCollection, loadEntry } = Collection.Pages;

vi.mock('@lib/i18n', () => {
  const locales = ['en', 'nl'] as const;
  return {
    locales,
    getLocale: () => locales[1],
    isLocale: (l: string) => (locales as readonly string[]).includes(l),
  };
});

vi.mock('@lib/routing/page', () => ({
  getPagePath: ({ page }: { page: { slug: string } }) => {
    return `${page.slug}`;
  },
  getParentPages: () => [],
}));

vi.mock('@lib/datocms', () => {
  const homeSlugs = [
    { locale: 'en', value: 'home' }, 
    { locale: 'nl', value: 'home' },
  ];
  const pageSlugs = [
    { locale: 'en', value: 'test' }, 
    { locale: 'nl', value: 'validatie' },
  ];
  const collection = [
    ...homeSlugs.map(({ locale, value: slug }) => ({
      record: {
        id: '1',
        title: `Home-${locale}`,
        slug,
        locale,
        _allSlugLocales: homeSlugs,
      }
    })),
    ...pageSlugs.map(({ locale, value: slug }) => ({
      record: {
        id: '2',
        title: `Page-${locale}`,
        slug,
        locale,
        _allSlugLocales: pageSlugs,
      }
    })),
  ];
  type Arguments = { variables: { slug: string, locale: string } };
  return {
    datocmsRequest: ({ variables: { slug, locale } }: Arguments) => 
      Promise.resolve(collection.find(({ record }) =>
        record.slug === slug && record.locale === locale
      ) || {}),
    datocmsCollection: () => Promise.resolve(collection),
  };
});

describe('loadCollection', async () => {
  test('loads the home page from the collection ', async () => {
    const entries = await loadCollection();
    expect(entries).toBeDefined();
  });
});
describe('loadEntry', async () => {
  const locales = ['en', 'nl'] as const;
  const homePageSlug = 'home';
  test('loads the home page from the collection', async () => {
    locales.forEach(async (locale) => {
      const entry = await loadEntry(homePageSlug, locale);
      expect(entry).toBeDefined();
      expect(entry?.id).toBe(`${locale}/${homePageSlug}`);
    });
  });
  
  test('home page pageUrls point to locale home', async () => {
    locales.forEach(async (locale) => {
      const entry = await loadEntry(homePageSlug, locale);
      entry?.meta.pageUrls.forEach(({ pathname, locale }) => {
        expect(pathname).toBe(`/${locale}`);
      });
    });
  });
  
  test('loads any page from the collection', async () => {
    const localizedSlugs = {
      [locales[0]]: 'test',
      [locales[1]]: 'validatie',
    };
    locales.forEach(async (locale) => {
      const entry = await loadEntry(localizedSlugs[locale], locale);
      expect(entry).toBeDefined();
      expect(entry?.id).toBe(`${locale}/${localizedSlugs[locale]}`);
    });
  });
  
  test('returns undefined when no entry is found', async () => {
    locales.forEach(async (locale) => {
      const entry = await loadEntry('foo', locale);
      expect(entry).toBeUndefined();
    });
  });
});
