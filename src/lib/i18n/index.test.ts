import { describe, expect, test, vi } from 'vitest';
import { defaultLocale, getFallbackLocales, getLocale, getLocaleName, setLocale, t } from '@lib/i18n';
import { locales } from '@lib/site.json';

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

describe('i18n:', () => {
  test('"defaultLocale" should be the first locale', () => {
    expect(defaultLocale).toBe(locales[0]);
  });

  test('i18n instance should be initialized with the defaultLocale', () => {
    expect(getLocale()).toBe(defaultLocale);
  });

  describe('getFallbackLocale:', () => {
    test('should return generic language from locale with region suffix', () => {
      expect(getFallbackLocales('en_GB')[0]).toBe('en');
      expect(getFallbackLocales('en-GB')[0]).toBe('en');
      expect(getFallbackLocales('nl_BE')[0]).toBe('nl');
      expect(getFallbackLocales('nl-BE')[0]).toBe('nl');
    });
    
    test('should not return generic language not in site locales', () => {
      expect(getFallbackLocales('fr_FR')[0]).not.toBe('fr');
      expect(getFallbackLocales('fr-FR')[0]).not.toBe('fr');
      expect(getFallbackLocales('de_CH')[0]).not.toBe('de');
      expect(getFallbackLocales('de-CH')[0]).not.toBe('de');
    });

    test('last fallback should be the default locale', () => {
      const [final] = getFallbackLocales('unsupported_locale').reverse();
      expect(final).toBe(defaultLocale);
    });

    test('return empty list when requested locale is default locale', () => {
      expect(getFallbackLocales(defaultLocale)).toStrictEqual([]);
    });
  });

  describe('getLocale:', () => {
    test('should return the current locale', () => {
      locales.forEach((locale) => {
        setLocale(locale);
        expect(getLocale()).toBe(locale);
      });

      setLocale();
      expect(setLocale()).toBe(locales[locales.length - 1]);
    });
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

  describe('setLocale:', () => {
    test('should update the current locale', () => {
      locales.forEach((locale) => {
        expect(setLocale(locale)).toBe(locale);
      });
    });

    test('should only update current locale if locale is supported', () => {
      locales.forEach((locale) => {
        expect(setLocale(locale)).toBe(locale);
      });

      // expect last locale in locales to be the active locale
      expect(setLocale()).toBe(locales[locales.length - 1]);

      expect(setLocale('unsupported_locale')).not.toBe('unsupported_locale');
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
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      t('unsupported_translation_key');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
