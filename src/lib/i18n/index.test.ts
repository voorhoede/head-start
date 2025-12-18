import { afterEach, describe, expect, test, vi } from 'vitest';
import { defaultLocale, getLocale, getLocaleName, setLocale, t } from '@lib/i18n';

// these imports will resolve to their mocked counterparts
import { locales } from '@lib/site.json';

// to verify that unsupported locales are handled correctly we test with locales that we know do not exist (e.g. 'unsupported_locale')
// TS does not like this, so we supress the warnings with a ts-expect-error comment

vi.mock('@lib/i18n/messages.json', () => {
  return {
    default: {
      en: {
        search: 'search',
        login: {
          enter_password: 'enter your password',
          welcome: 'welcome back {{ name }}',
        },
      },
      nl: {
        search: 'zoek',
        login: {
          enter_password: 'vul je wachtwoord in',
          welcome: 'welkom terug {{ name }}',
        },
      },
    }
  };
});

vi.mock('@lib/site.json', () => {
  return {
    locales: [
      'en',
      'nl',
    ],
  };
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('i18n:', () => {
  test('"defaultLocale" should be the first locale', () => {
    expect(defaultLocale).toBe(locales[0]);
  });

  test('i18n instance should be initialized with the defaultLocale', () => {
    expect(getLocale()).toBe(defaultLocale);
  });

  describe('setLocale:', () => {
    test('should update the current locale', () => {
      expect(setLocale('en')).toBe('en');
      expect(setLocale('nl')).toBe('nl');
    });

    test('should only update current locale if locale is supported', () => {
      expect(setLocale('en')).toBe('en');
      expect(setLocale('nl')).toBe('nl');

      // expect 'nl' because the locale was most recently set to 'nl'
      expect(setLocale()).toBe('nl');

      expect(setLocale('unsupported_locale')).not.toBe('unsupported_locale');
    });
  });

  test('"getLocale" should return the current locale', () => {
    setLocale('nl');
    expect(getLocale()).toBe('nl');

    setLocale('en');
    expect(getLocale()).toBe('en');

    // expect 'en' because the locale was most recently set to 'en'
    setLocale();
    expect(getLocale()).toBe('en');
  });

  describe('getLocaleName:', () => {
    test('should return the name of a locale', () => {
      expect(getLocaleName('en')).toBe('English');
      expect(getLocaleName('nl')).toBe('Nederlands');
    });

    test('should return a code instead of a name if locale is not supported', () => {
      expect(getLocaleName('xx')).toBe('xx');
    });
  });

  describe('t:', () => {
    test('should return translations', () => {
      setLocale('en');
      expect(t('search')).toBe('search');
      expect(t('login.enter_password')).toBe('enter your password');

      setLocale('nl');
      expect(t('search')).toBe('zoek');
      expect(t('login.enter_password')).toBe('vul je wachtwoord in');
    });

    test('should return translations with interpolated values', () => {
      setLocale('en');
      expect(t('login.welcome', { name: 'wessel' })).toBe('welcome back wessel');

      setLocale('nl');
      expect(t('login.welcome', { name: 'wessel' })).toBe('welkom terug wessel');
    });

    test('should return translations for a specific locale', () => {
      expect(t('search', {}, 'en')).toBe('search');
      expect(t('search', {}, 'nl')).toBe('zoek');
    });

    test('should return translations for a specific locale with interpolated values', () => {
      expect(t('login.welcome', { name: 'wessel' }, 'en')).toBe('welcome back wessel');
      expect(t('login.welcome', { name: 'wessel' }, 'nl')).toBe('welkom terug wessel');
    });

    test('should log a warning if translation for given key does not exist', () => {
      // we use .mockImplementation(() => {}) to prevent the console from actually logging the warning
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      t('unsupported_translation_key');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
