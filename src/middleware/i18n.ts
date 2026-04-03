import { defineMiddleware } from 'astro:middleware';
import { defaultLocale, isLocale, setLocale } from '~/lib/i18n';

/**
 * i18n middleware:
 * ensure a locale is always defined in the context.params object
 */
export const i18n = defineMiddleware(async ({ params, request }, next) => {
  if (!params.locale) {
    // if the locale param is unavailable, it didn't match a [locale]/* route
    // so we attempt to extract the locale from the URL and fallback to the default locale
    const pathLocale = new URL(request.url).pathname.split('/')[1];
    const locale = isLocale(pathLocale)
      ? pathLocale
      : defaultLocale;
    Object.assign(params, { locale });
  }
  setLocale(params.locale);

  const response = await next();
  return response;
});
