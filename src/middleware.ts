import { defineMiddleware, sequence } from 'astro/middleware';
import { defaultLocale, locales, setLocale } from './lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';
import { getRedirectTarget } from '@lib/routing/redirects';
import { datocmsEnvironment } from '@root/datocms-environment';
import { DATOCMS_READONLY_API_TOKEN, HEAD_START_PREVIEW_SECRET, HEAD_START_PREVIEW } from 'astro:env/server';

export const previewCookieName = 'HEAD_START_PREVIEW';

export const hashSecret = async (secret: string) => {
  const msgUint8 = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const datocms = defineMiddleware(async ({ locals }, next) => {
  Object.assign(locals, {
    datocmsEnvironment,
    datocmsToken: DATOCMS_READONLY_API_TOKEN
  });
  const response = await next();
  return response;
});

const i18n = defineMiddleware(async ({ params, request }, next) => {
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

const preview = defineMiddleware(async ({ cookies, locals }, next) => {
  const previewSecret = HEAD_START_PREVIEW_SECRET!;
  Object.assign(locals, {
    isPreview: HEAD_START_PREVIEW,
    isPreviewAuthOk: Boolean(previewSecret) && cookies.get(previewCookieName)?.value === await hashSecret(previewSecret),
    previewSecret
  });
  const response = await next();

  if (locals.isPreview) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  return response;
});

/**
 * Redirects middleware:
 * If there is no matching route (404) and there is a matching redirect rule,
 * redirect to the target URL with the specified status code.
 */
const redirects = defineMiddleware(async ({ request, redirect }, next) => {
  const response = await next();
  if (response.status === 404) {
    const { pathname } = new URL(request.url);
    const redirectTarget = getRedirectTarget(pathname);
    if (redirectTarget) {
      return redirect(redirectTarget.url, redirectTarget.statusCode);
    }
  }
  return response;
});

export const onRequest = sequence(datocms, i18n, preview, redirects);
