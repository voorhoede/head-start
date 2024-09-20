import { defineMiddleware, sequence } from 'astro/middleware';
import { setLocale } from './lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';
import { getRedirectTarget } from '@lib/routing/redirects';
import { datocmsEnvironment } from '@root/datocms-environment';
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
  const response = await next();
  return response;
});

const i18n = defineMiddleware(async ({ params }, next) => {
  if (params.locale) {
    setLocale(params.locale as SiteLocale);
  }
  const response = await next();
  return response;
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
