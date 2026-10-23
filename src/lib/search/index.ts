import type { SiteLocale } from '~/lib/datocms/schema';
import { getLocale } from '~/lib/i18n';
import { globalSeo } from '~/lib/site.json';

/**
 * `globalSeo` is `null` in projects without SEO settings, and its per-locale
 * keys are missing when only one locale is configured in Dato. Its inferred
 * type therefore depends on the downloaded `site.json`, so we declare it here.
 */
const globalSeoByLocale = globalSeo as Record<string, { siteName?: string }> | null;

export const queryParamName = 'query';
export const minQueryLength = 3;
export const hasValidQuery = (query: string) => (query.length >= minQueryLength);
export const getSearchPathname = (locale: SiteLocale = getLocale()) => `/${ locale }/search/`;
export const getOpenSearchName = (locale: SiteLocale = getLocale()) => `${globalSeoByLocale?.[locale]?.siteName} (${ locale })`;
export const getOpenSearchPathname = (locale: SiteLocale) => `${ getSearchPathname(locale) }opensearch.xml`;

// https://www.datocms.com/docs/site-search/excluding-text
export const datocmsNoIndex = { 'data-datocms-noindex': '' };
