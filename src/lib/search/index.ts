import type { SiteLocale } from '~/lib/datocms/types';
import { getLocale } from '~/lib/i18n';
import { globalSeo } from '~/lib/site.json';

export const queryParamName = 'query';
export const minQueryLength = 3;
export const hasValidQuery = (query: string) => (query.length >= minQueryLength);
export const getSearchPathname = (locale: SiteLocale = getLocale()) => `/${ locale }/search/`;
export const getOpenSearchName = (locale: SiteLocale = getLocale()) => `${globalSeo[locale as keyof typeof globalSeo]?.siteName} (${ locale })`;
export const getOpenSearchPathname = (locale: SiteLocale) => `${ getSearchPathname(locale) }opensearch.xml`;

// https://www.datocms.com/docs/site-search/excluding-text
export const datocmsNoIndex = { 'data-datocms-noindex': '' };
