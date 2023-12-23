import { defineMiddleware, sequence } from 'astro/middleware';
import { setLocale } from './lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';
import { datocmsEnvironment } from '../datocms-environment';

export const previewCookieName = 'HEAD_START_PREVIEW';

export const hashSecret = async (secret: string) => {
  const msgUint8 = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const datocms = defineMiddleware(async ({ locals }, next) => {
  locals.datocmsEnvironment = datocmsEnvironment;
  locals.datocmsToken = import.meta.env.DATOCMS_READONLY_API_TOKEN;
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
  const previewSecret = import.meta.env.HEAD_START_PREVIEW_SECRET;
  locals.isPreview = import.meta.env.HEAD_START_PREVIEW;
  locals.isPreviewAuthOk = previewSecret && cookies.get(previewCookieName)?.value === await hashSecret(previewSecret);
  locals.previewSecret = previewSecret;
  const response = await next();

  if (locals.isPreview) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  return response;
});

export const onRequest = sequence(datocms, i18n, preview);
