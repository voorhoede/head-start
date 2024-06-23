import type { SiteLocale, TranslationKey } from './i18n.types';
import rosetta from 'rosetta';
import messages from './i18n.messages.json';
import { locales as siteLocales } from './site.json';

export const locales = siteLocales as SiteLocale[];
export const defaultLocale = locales[0];
export const cookieName = 'HEAD_START_LOCALE';

const i18n = rosetta(messages);
i18n.locale(defaultLocale);

export type T = typeof i18n.t & ((key: TranslationKey) => string);
export const t: T = (key: TranslationKey) => {
  const translate = i18n.t.bind(i18n);
  const translation = translate(key);
  if (!translation) console.warn(`\x1b[33mMissing translation for key: ${key}`);
  return translation;
};

export function getLocale() {
  return i18n.locale();
}


export function setLocale(locale?: SiteLocale) {
  if (locale && locales.includes(locale)) {
    return i18n.locale(locale);
  }
  return i18n.locale();
}

/**
 * Returns locale name for a given code in its own language.
 * @example getLocaleName('nl') => 'Nederlands'
 */
export function getLocaleName(code: string) {
  const localeName = new Intl.DisplayNames([code], { type: 'language' }).of(code);
  if (localeName) {
    return localeName;
  }
  return code.toUpperCase();
}
