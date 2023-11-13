import { defineMiddleware, sequence } from 'astro/middleware';
import { setLocale } from './lib/i18n';
import { datocmsEnvironment } from '../datocms-environment';

export const previewCookieName = 'HEAD_START_PREVIEW';

export const datocms = defineMiddleware(async ({ locals }, next) => {
  locals.datocmsEnvironment = datocmsEnvironment;
  locals.datocmsToken = import.meta.env.DATOCMS_READONLY_API_TOKEN;
  return next();
});

const i18n = defineMiddleware(async ({ params }, next) => {
  if (params.locale) {
    setLocale(params.locale);
  }
  return next();
});

const preview = defineMiddleware(async ({ cookies, locals }, next) => {
  const previewSecret = import.meta.env.HEAD_START_PREVIEW_SECRET;
  locals.isPreview = import.meta.env.HEAD_START_PREVIEW;
  locals.isPreviewAuthOk = previewSecret && cookies.get(previewCookieName)?.value === previewSecret;
  locals.previewSecret = previewSecret;
  return next();
});

export const onRequest = sequence(datocms, i18n, preview);
