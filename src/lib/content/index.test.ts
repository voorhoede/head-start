import { describe, expect, test, vi } from 'vitest';
import { getCollection, getEntry, combine, split } from './index';
import type { collectionMap } from '@content/config';

function mockEntry(id: string, locale?: string) {
  const meta = locale ? { locale } : {};
  return {
    id: locale ? `${locale}/${id}` : id,
    data: { meta },
  };
}

vi.mock('@lib/i18n', () => {
  const locales = ['en', 'nl'] as const;
  return {
    locales,
    getLocale: () => locales[1],
    isLocale: (l: string) => (locales as readonly string[]).includes(l),
  };
});

vi.mock('@content/config', async () => {
  const { locales } = await import('@lib/i18n');
  const localizedItems = ['a', 'b', 'c'].flatMap(id =>
    locales.map(locale => mockEntry(id, locale))
  );
  const nonLocalizedItems = ['a', 'b', 'c'].map(id => mockEntry(id));

  const collectionMap = {
    LocalizedItems: {
      loadCollection: async () => Promise.resolve(localizedItems),
    },
    NonLocalizedItems: {
      loadCollection: async () => Promise.resolve(nonLocalizedItems),
    },
  };

  return { collectionMap };
});

// Mocking the Astro content module to simulate collections,
vi.mock('astro:content', async () => {
  const { collectionMap } = await import('@content/config');

  return {
    getCollection: async (
      collection: keyof typeof collectionMap,
      filter: (entry: unknown) => unknown
    ) => {
      const entries = await collectionMap[collection].loadCollection();
      return filter
        ? entries.filter(filter)
        : entries;
    },
    getEntry: async (collection: keyof typeof collectionMap, id: string) => {
      const entries = await collectionMap[collection].loadCollection();
      return entries.find(e => e.id === id);
    },
  };
});

vi.mock('astro:env/server', () => ({
  HEAD_START_PREVIEW: false,
  PUBLIC_IS_PRODUCTION: true,
}));

describe('getCollection', async () => {
  const { collectionMap } = await import('@content/config');
  const { locales, getLocale } = await import('@lib/i18n');
  test('filters by locale by default', async () => {
    const collection = 'LocalizedItems' as keyof typeof collectionMap;
    const entries = await getCollection(collection);
    const locale = getLocale();
    const length = (await collectionMap[collection].loadCollection()).length;
    const filteredLength = length / locales.length; // Assuming each id has an entry for each locale
    expect(entries).toHaveLength(filteredLength);
    expect(entries.map(({ data: { meta: { locale } } }) => ({ locale })))
      .toEqual([
        { locale },
        { locale },
        { locale },
      ]);
  });
  test('does not filter if entries do not have a locale', async () => {
    const collection = 'NonLocalizedItems' as keyof typeof collectionMap;
    const entries = await getCollection(collection);
    const length = (await collectionMap[collection].loadCollection()).length;
    expect(entries).toHaveLength(length);
  });
  test('does not filter localized entries when locale is set to null', async () => {
    const collection = 'LocalizedItems' as keyof typeof collectionMap;
    const entries = await getCollection(collection, undefined, null);
    const length = (await collectionMap[collection].loadCollection()).length;
    expect(entries).toHaveLength(length);
  });
});

describe('getEntry', async () => {
  const { getLocale } = await import('@lib/i18n');
  test('filters by locale by default', async () => {
    const collection = 'LocalizedItems' as keyof typeof collectionMap;
    const id = 'a';
    const entry = await getEntry(collection, id);
    const locale = getLocale();
    expect(entry).toBeDefined();
    expect(entry?.id).toBe(`${locale}/${id}`);
    expect(entry?.data.meta.locale).toBe(locale);
  });
  test('does not filter if entries do not have a locale', async () => {
    const collection = 'NonLocalizedItems' as keyof typeof collectionMap;
    const id = 'a';
    const entry = await getEntry(collection, id);
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
      const result = split(combine({ id, locale }));
      expect(result).toStrictEqual({ id: 'a/b/c', locale });
    });
  });
});
