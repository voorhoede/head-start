import { defineMiddleware } from 'astro/middleware';
import { datocmsEnvironment } from '../datocms-environment';

export const onRequest = defineMiddleware((context, next) => {
  context.locals.datocmsEnvironment = datocmsEnvironment;
  context.locals.datocmsToken = import.meta.env.DATOCMS_READONLY_API_TOKEN;
  context.locals.isPreview = true;
  return next();
});
