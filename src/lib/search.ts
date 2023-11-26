import { getLocale } from './i18n';

export const minQueryLength = 3;
export const hasValidQuery = (query: string) => (query.length >= minQueryLength);
export const getSearchPathname = (locale = getLocale()) => `/${ locale }/search/`;
export const getOpenSearchPathname = (locale: string) => `${ getSearchPathname(locale) }opensearch.xml`;
