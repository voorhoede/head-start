import type { SiteLocale, TranslationKey } from './i18n.types';
import rosetta from 'rosetta';
import messages from './i18n.messages.json';

export const locales: SiteLocale[] = ['en', 'nl'];
export const defaultLocale = locales[0];

const i18n = rosetta(messages);
i18n.locale(defaultLocale);

export type T = typeof i18n.t & ((key: TranslationKey) => string);
export const t: T = i18n.t.bind(i18n);

export function getLocale() {
  return i18n.locale();
}

export function setLocale(locale?: SiteLocale) {
  const newLocale = locale || defaultLocale;
  return i18n.locale(newLocale);
}
