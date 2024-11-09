import { afterEach, describe, test, expect, vi } from 'vitest';
import { siteName, titleSuffix, titleTag, } from '@lib/seo';
import { getLocale } from '@lib/i18n';

vi.mock('@lib/i18n', () => ({
  getLocale: vi.fn(),
}));

vi.mock('@lib/site.json', () => ({
  globalSeo: {
    en: {
      siteName: 'Test Site (English)',
      titleSuffix: '| English Site',
    },
    nl: {
      siteName: 'Test Site (Dutch)',
      titleSuffix: '| Nederlandse Site',
    },
  },
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('seo', () => {
  test('siteName is correctly set for different locales', () => {
    vi.mocked(getLocale).mockReturnValue('en');
    expect(siteName()).toBe('Test Site (English)');

    vi.mocked(getLocale).mockReturnValue('nl');
    expect(siteName()).toBe('Test Site (Dutch)');
  });

  test('titleSuffix is correctly set for different locales', () => {
    vi.mocked(getLocale).mockReturnValue('en');
    expect(titleSuffix()).toBe('| English Site');

    vi.mocked(getLocale).mockReturnValue('nl');
    expect(titleSuffix()).toBe('| Nederlandse Site');
  });

  test('titleTag generates correct title for different locales', () => {
    vi.mocked(getLocale).mockReturnValue('en');
    expect(titleTag('Test Page')).toEqual({
      tag: 'title',
      content: 'Test Page | English Site',
    });

    vi.mocked(getLocale).mockReturnValue('nl');
    expect(titleTag('Testpagina')).toEqual({
      tag: 'title',
      content: 'Testpagina | Nederlandse Site',
    });
  });
});
