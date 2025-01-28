import { defineMiddleware } from 'astro:middleware';
import { defaultLocale, locales, setLocale } from '@lib/i18n';
import type { SiteLocale } from '@lib/i18n/types';

/**
 * i18n middleware:
 * ensure a locale is always defined in the context.params object
 */
export const i18n = defineMiddleware(async ({ params, request }, next) => {
  if (!params.locale) {
    // if the locale param is unavailable, it didn't match a [locale]/* route
    // so we attempt to extract the locale from the URL and fallback to the default locale
    const pathLocale = new URL(request.url).pathname.split('/')[1];
    const locale = locales.includes(pathLocale as SiteLocale)
      ? pathLocale
      : defaultLocale;
    Object.assign(params, { locale });
  }
  setLocale(params.locale as SiteLocale);

  const response = await next();
  return response;
});
