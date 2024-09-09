import { describe, expect, test, vi } from 'vitest';
import { t, getLocale, getLocaleName, setLocale } from './i18n';

// to verify that unsupported locales are handled correctly we test with locales that we know do not exist (e.g. 'unsupported_locale')
// TS does not like this, so we supress the warnings with a ts-expect-error comment

vi.mock('./i18n.messages.json', () => {
  return {
    default: {
      en: {
        search: 'search',
      },
      nl: {
        search: 'zoek',
      }
    }
  };
});

// TODO: add tests for interpolation and language options

describe('i18n:', () => {
  test('"setLocale" should update the current locale', () => {
    expect(setLocale('en')).toBe('en');
    expect(setLocale('nl')).toBe('nl');
  });

  test('"setLocale" should only update current locale if locale is supported', () => {
    expect(setLocale('en')).toBe('en');
    expect(setLocale('nl')).toBe('nl');

    // expect 'nl' because the locale was most recently set to 'nl'
    expect(setLocale()).toBe('nl');

    // @ts-expect-error we know that 'unsupported_locale' is not a supported locale
    expect(setLocale('unsupported_locale')).not.toBe('unsupported_locale');
  });

  test('"getLocale" should return the current locale', () => {
    setLocale('nl');
    expect(getLocale()).toBe('nl');

    setLocale('en');
    expect(getLocale()).toBe('en');

    setLocale();
    expect(getLocale()).toBe('en');
  });

  test('"getLocaleName" should return the name of a locale', () => {
    expect(getLocaleName('en')).toBe('English');
    expect(getLocaleName('nl')).toBe('Nederlands');
  });

  test('"getLocaleName" should return a code instead of a name if locale is not supported', () => {
    expect(getLocaleName('aa')).toBe('AA');
    expect(getLocaleName('bb')).toBe('BB');
  });

  test('"t" should return a translation', () => {
    setLocale('en');
    expect(t('search')).toBe('search');

    setLocale('nl');
    expect(t('search')).toBe('zoek');
  });

  test('"t" should log a warning if translation for given key does not exist', () => {
    // we use .mockImplementation(() => {}) to prevent the console from actually logging the warning
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    t('unsupported_translation_key');

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('\x1b[33mMissing translation for key: unsupported_translation_key');
  });
});
