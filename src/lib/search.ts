import { getLocale } from './i18n';
import { globalSeo } from './site.json';

export const queryParamName = 'query';
export const minQueryLength = 3;
export const hasValidQuery = (query: string) => (query.length >= minQueryLength);
export const getSearchPathname = (locale = getLocale()) => `/${ locale }/search/`;
export const getOpenSearchName = (locale = getLocale()) => `${globalSeo[locale as keyof typeof globalSeo]?.siteName} (${ locale })`;
export const getOpenSearchPathname = (locale: string) => `${ getSearchPathname(locale) }opensearch.xml`;

// https://www.datocms.com/docs/site-search/excluding-text
export const datocmsNoIndex = { 'data-datocms-noindex': '' };
