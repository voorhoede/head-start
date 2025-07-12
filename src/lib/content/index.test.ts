import { describe, expect, test, vi } from 'vitest';
import { getCollection, getEntry, combine, split } from './index';
import { getLocale } from '@lib/i18n';

const locales = ['en', 'nl'] as const;
const collections = {
  'LocalizedItems': [
    { id: `${locales[0]}/a`, data: { locale: locales[0], title: 'First Item' } },
    { id: `${locales[0]}/b`, data: { locale: locales[0], title: 'Second Item' } },
    { id: `${locales[0]}/c`, data: { locale: locales[0], title: 'Third Item' } },
    { id: `${locales[1]}/a`, data: { locale: locales[1], title: 'Eerste onderdeel' } },
    { id: `${locales[1]}/b`, data: { locale: locales[1], title: 'Tweede onderdeel' } },
    { id: `${locales[1]}/c`, data: { locale: locales[1], title: 'Derde onderdeel' } },
  ],
  'NonLocalizedItems': [
    { id: 'a', data: { title: 'First Item' } },
    { id: 'b', data: { title: 'Second Item' } },
    { id: 'c', data: { title: 'Third Item' } },
  ]
} as const;

vi.mock('@lib/i18n', () => {
  const locales = ['en', 'nl'] as const;
  return {
    locales,
    getLocale: () => locales[1],
    isLocale: (l: string) => (locales as readonly string[]).includes(l),
  };
});

// Mocking the Astro content module to simulate collections,
vi.mock('astro:content', async (original) => {
  const actual = await original();
  return {
    ...actual || {},
    // getAstroCollection
    getCollection: (
      collection: keyof typeof collections, 
      filter: (entry: unknown) => unknown
    ) => {
      return filter
        ? collections[collection].filter(filter)
        : collections[collection];
    },
    // getAstroCollectionEntry
    getEntry: (collection: keyof typeof collections, id: string) => {
      const entry = collections[collection].find(e => e.id === id);
      return entry ? { ...entry, data: { ...entry.data } } : undefined;
    },
  };
});

vi.mock('astro:env/server', () => ({
  HEAD_START_PREVIEW: false,
  PUBLIC_IS_PRODUCTION: true,
}));

describe('getCollection', () => {
  test('filters by locale by default', async () => {
    const collection = 'LocalizedItems';
    const entries = await getCollection(collection as 'PagePartials');
    const locale = getLocale();
    expect(entries).toHaveLength(3);
    expect(
      entries.map(({ data: { locale } }) => ({ locale }))
    ).toEqual([
      { locale },
      { locale },
      { locale },
    ]);
  });
  test('does not filter if entries do not have a locale', async () => {
    const collection = 'NonLocalizedItems';
    const entries = await getCollection(collection as 'PagePartials');
    expect(entries).toHaveLength(3);
    expect(entries).toEqual(collections[collection]);
  });
  test('does not filter localized entries when locale is set to null', async () => {
    const collection = 'LocalizedItems';
    const entries = await getCollection(collection as 'PagePartials', undefined, null);
    expect(entries).toHaveLength(6);
  });
});

describe('getEntry', () => {
  test('filters by locale by default', async () => {
    const collection = 'LocalizedItems';
    const id = 'a';
    const entry = await getEntry(collection as 'PagePartials', id);
    const locale = getLocale();
    expect(entry).toBeDefined();
    expect(entry?.id).toBe(`${locale}/${id}`);
    expect(entry?.data.locale).toBe(locale);
  });
  test('does not filter if entries do not have a locale', async () => {
    const collection = 'NonLocalizedItems';
    const id = 'a';
    const entry = await getEntry(collection as 'PagePartials', id);
    expect(entry).toBeDefined();
  });
});

describe('combine', () => {
  test('appends a separator and locale to a given id', async () => {
    const { locales } = await import('@lib/i18n');
    locales.forEach(locale => {
      const result = combine({ id: 'a/b/c', locale });
      expect(result).toBe(`${locale}/a/b/c`);
    });
  });
  test('does not alter id when locale is falsy', () => {
    const locales = [undefined, null];
    locales.forEach(locale => {
      const result = combine({ id: 'a/b/c', locale });
      expect(result).toBe('a/b/c');
    });
  });
});

describe('split', () => {
  test('extracts locale from id with appended locale', () => {
    const result = split('nl/a/b/c');
    expect(result).toStrictEqual({ id: 'a/b/c', locale: 'nl' });
  });
  test('returns undefined when no locale is present', () => {
    const result = split('a/b/c');
    expect(result).toStrictEqual({ id: 'a/b/c', locale: null });
  });
  test('extracts locale added with combine', async () => {
    const { locales } = await import('@lib/i18n');
    const id = 'a/b/c';
    locales.forEach(locale => {
      const result = split(combine({ id, locale } ));
      expect(result).toStrictEqual({ id: 'a/b/c', locale });
    });
  });
});
