import { defineMiddleware } from 'astro/middleware';
import { datocmsEnvironment } from '../datocms-environment';

export const previewCookieName = 'HEAD_START_PREVIEW';

export const onRequest = defineMiddleware(({ cookies, locals }, next) => {
  const previewSecret = import.meta.env.HEAD_START_PREVIEW_SECRET;
  locals.datocmsEnvironment = datocmsEnvironment;
  locals.datocmsToken = import.meta.env.DATOCMS_READONLY_API_TOKEN;
  locals.isPreview = import.meta.env.HEAD_START_PREVIEW;
  locals.isPreviewAuthOk = previewSecret && cookies.get(previewCookieName)?.value === previewSecret;
  locals.previewSecret = previewSecret;
  return next();
});
