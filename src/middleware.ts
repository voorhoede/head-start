import { defineMiddleware, sequence } from 'astro/middleware';
import { setLocale, locales, defaultLocale } from './lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';
import { datocmsEnvironment } from '../datocms-environment';
import { getSecret } from 'astro:env/server';

export const previewCookieName = 'HEAD_START_PREVIEW';

export const hashSecret = async (secret: string) => {
  const msgUint8 = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const datocms = defineMiddleware(async ({ locals }, next) => {
  locals.datocmsEnvironment = datocmsEnvironment;
  locals.datocmsToken = getSecret('DATOCMS_READONLY_API_TOKEN');
  const repsonse = await next();
  return repsonse;
});

const i18n = defineMiddleware(async ({ params }, next) => {
  if (params.locale) {
    setLocale(params.locale as SiteLocale);
  }
  const repsonse = await next();
  return repsonse;
});

const preview = defineMiddleware(async ({ cookies, locals }, next) => {
  const previewSecret = getSecret('HEAD_START_PREVIEW_SECRET');
  locals.isPreview = getSecret('HEAD_START_PREVIEW');
  locals.isPreviewAuthOk = Boolean(previewSecret) && cookies.get(previewCookieName)?.value === await hashSecret(previewSecret);
  locals.previewSecret = previewSecret;
  const response = await next();

  if (locals.isPreview) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  return response;
});

const notFound = defineMiddleware(async ({ url }, next) => {
  const response = await next();

  // if a page is not found (404), return the notfound page in the matching locale:
  if (response.status === 404) {
    const [pathLocale, pathSlug] = url.pathname.split('/').slice(1);
    const notFoundSlug = 'notfound';
    // prevent infinite loop on the notfound page
    if (pathSlug !== notFoundSlug) {
      const pageLocale = locales.includes(pathLocale as SiteLocale) ? pathLocale : defaultLocale;
      const notFoundPageUrl = new URL(`/${pageLocale}/${notFoundSlug}/`, url);
      const html = await fetch(notFoundPageUrl).then((res) => res.text());
      return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html' } });
    }
  }

  return response;
});

export const onRequest = sequence(datocms, i18n, preview, notFound);
