import { describe, expect, test, vi } from 'vitest';
import { t, getLocale, getLocaleName, setLocale } from './i18n';

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

const EN_LOCALE = 'en';
const NL_LOCALE = 'nl';

describe('i18n', () => {
  test('"setLocale" should update the current locale', () => {
    const baseline = setLocale(EN_LOCALE);
    expect(baseline).toBe(EN_LOCALE);

    const updatedLocale = setLocale(NL_LOCALE);
    expect(updatedLocale).toBe(NL_LOCALE);
  });

  test('"setLocale" should not update current locale if no locale is given', () => {
    const baseline = setLocale(EN_LOCALE);
    expect(baseline).toBe(EN_LOCALE);

    const updatedLocale = setLocale();
    expect(updatedLocale).toBe(baseline);
  });

  test('"getLocale" should return the current locale', () => {
    setLocale(NL_LOCALE);
    const baselineLocale = getLocale();

    expect(baselineLocale).toBe(NL_LOCALE);

    setLocale(EN_LOCALE);
    const updatedLocale = getLocale();

    expect(updatedLocale).toBe(EN_LOCALE);
  });

  test('"getLocaleName" should return the name of a locale', () => {
    const locale = setLocale(EN_LOCALE);
    const localeName = getLocaleName(locale);

    expect(localeName).toBe('English');
  });

  test('"getLocaleName" should return a code instead of a name if locale is not supported', () => {
    const localeName = getLocaleName('aa');

    expect(localeName).toBe('AA');
  });

  test('"t" should return a translation', () => {
    const translationKey = 'search';

    setLocale(EN_LOCALE);
    const enTranslation = t(translationKey);

    expect(enTranslation).toBe('search');

    setLocale(NL_LOCALE);
    const nlTranslation = t(translationKey);

    expect(nlTranslation).toBe('zoek');
  });

  test('"t" should log a warning if translation for given key does not exist', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    const translationKey = 'some_unsupported_translation_key';

    setLocale(EN_LOCALE);
    t(translationKey);

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(`\x1b[33mMissing translation for key: ${translationKey}`);

  });
});
