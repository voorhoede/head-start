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
  const notFoundSlugs = [
    { locale: 'en', value: 'not-found' },
    { locale: 'nl', value: 'niet-gevonden' },
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
    ...notFoundSlugs.map(({ locale, value: slug }) => ({
      record: {
        id: '3',
        title: `Not Found-${locale}`,
        slug,
        locale,
        _allSlugLocales: notFoundSlugs,
      }
    })),
  ];
  const getApp = (locale: string) => ({
    __typename: 'AppRecord',
    homePage: {
      id: '1',
      slug: homeSlugs.find(slugs => slugs.locale === locale)?.value,
    },
    notFoundPage: {
      id: '3',
      slug: notFoundSlugs.find(slugs => slugs.locale === locale)?.value,
    },
  });
  
  type Arguments = { variables: { slug: string, locale: string } };
  return {
    datocmsRequest: ({ variables: { slug, locale } }: Arguments) => {
      const result = collection.find(({ record }) =>
        record.slug === slug && record.locale === locale
      );
      return Promise.resolve({
        app: getApp(locale),
        record: result ? result.record : null,
      });
    },
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
  const homePageSlug = ''; // Home page slug is empty
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
