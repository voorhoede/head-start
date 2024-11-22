import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  hasValidQuery,
  getSearchPathname,
  getOpenSearchName,
  getOpenSearchPathname,
} from '@lib/search';

vi.mock('@lib/site.json', () => ({
  globalSeo: {
    en: { siteName: 'My Site' },
    nl: { siteName: 'Mijn Website' },
  },
  locales: {
    en: 'en',
    nl: 'nl',
  }
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('search', () => {
  describe('hasValidQuery:', () => {
    test('should return true for valid query', () => {
      expect(hasValidQuery('test')).toBe(true);
    });

    test('should return true for query as long as the min length', () => {
      expect(hasValidQuery('tes')).toBe(true);
    });

    test('should return false for query shorter than min length', () => {
      expect(hasValidQuery('')).toBe(false);
      expect(hasValidQuery('te')).toBe(false);
    });
  });

  test('"getSearchPathname" should return correct search pathname for a specific locale', () => {
    expect(getSearchPathname('en')).toBe('/en/search/');
    expect(getSearchPathname('nl')).toBe('/nl/search/');
  });

  test('"getOpenSearchName" should return correct OpenSearch name for a specific locale', () => {
    expect(getOpenSearchName('en')).toBe('My Site (en)');
    expect(getOpenSearchName('nl')).toBe('Mijn Website (nl)');
  });

  test('"getOpenSearchPathname" should return correct OpenSearch pathname for a specific locale', () => {
    expect(getOpenSearchPathname('en')).toBe('/en/search/opensearch.xml');
    expect(getOpenSearchPathname('nl')).toBe('/nl/search/opensearch.xml');
  });
});
