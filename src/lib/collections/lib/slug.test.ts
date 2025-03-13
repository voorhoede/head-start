import { describe, expect, test } from 'vitest';
import { combine, split, mapSlugsToIds } from './slug';
import type { SiteLocale } from '@lib/datocms/types';

const mockLocales = ['en', 'nl'] as SiteLocale[];

describe('combine', () => {
  test('appends a separator and locale to a given slug', () => {
    const result = combine('slug', 'locale');
    expect(result).toBe('slug/locale');
  });
  test('does not alter slug when locale is falsy', () => {
    const locales = [undefined, null, ''];
    locales.forEach(locale => {
      const result = combine('slug', locale);
      expect(result).toBe('slug');
    });
  });
  
});

describe('split', () => {
  test('extracts locale from slug with appended locale', () => {
    const result = split('slug/locale');
    expect(result).toStrictEqual({ slug: 'slug', locale: 'locale' });
  });
  test('returns undefined when no locale is present', () => {
    const result = split('slug');
    expect(result).toStrictEqual({ slug: 'slug', locale: undefined });
  });
  test('extracts locale added with combine', () => {
    const slug = 'slug';
    const locale = 'locale';
    const result = split(combine(slug, locale));
    expect(result).toStrictEqual({ slug: 'slug', locale });
  });
});

describe('mapSlugsToIds', () => {
  test('maps list of entries with slugs to their ids', () => {
    const entries = [
      { id: '1', slug: 'slug-1' },
      { id: '2', slug: 'slug-2' },
    ];
    const result = mapSlugsToIds(entries);
    expect(result.map(
      ({ id }) => ({ id })
    )).toEqual([
      { id: 'slug-1' },
      { id: 'slug-2' },
    ]);
  });
  
  test('maintains their original ids under `_id`', () => {
    const entries = [
      { id: '1', slug: 'slug-1' },
      { id: '2', slug: 'slug-2' },
    ];
    const result = mapSlugsToIds(entries);
    expect(result.map(
      ({ _id }) => ({ _id })
    )).toEqual([
      { _id: '1' },
      { _id: '2' },
    ]);
  });
  
  test('adds entries for each locale', () => {
    const entries = [
      { id: '1', _allSlugLocales: [
        { locale: mockLocales[0], value: 'page-1' },
        { locale:  mockLocales[1], value: 'pagina-1' },
      ] },
      { id: '2', _allSlugLocales: [
        { locale:  mockLocales[0], value: 'page-2' },
        { locale:  mockLocales[1], value: 'pagina-2' },
      ] },
    ];
    const result = mapSlugsToIds(entries);
    expect(result.map(
      ({ id }) => ({ id })
    )).toEqual([
      { id: 'page-1/en' },
      { id: 'pagina-1/nl' },
      { id: 'page-2/en' },
      { id: 'pagina-2/nl' },
    ]);
  });
});
