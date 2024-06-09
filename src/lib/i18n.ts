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
export const t: T = i18n.t.bind(i18n);

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
 * This method only supports a few languages, to keep the bundle size small when used client-side.
 * To add more, see: https://github.com/adlawson/nodejs-langs/blob/master/data.js (not available in ESM)
 */
export function getLocaleName(code: string) {
  // @todo: replace by new Intl.DisplayNames() like in FileLink.astro
  const localeNamesByCode = {
    'de': 'Deutsch',
    'en': 'English',
    'es': 'Español',
    'fr': 'Français',
    'it': 'Italiano',
    'nl': 'Nederlands',
  };
  const localeName = localeNamesByCode[code as keyof typeof localeNamesByCode];
  if (localeName) {
    return localeName;
  }
  return code.toUpperCase();
}
