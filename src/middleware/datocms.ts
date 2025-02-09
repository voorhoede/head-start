import { defineMiddleware } from 'astro:middleware';
import { datocmsEnvironment } from '@root/datocms-environment';
import { DATOCMS_READONLY_API_TOKEN } from 'astro:env/server';

export const datocms = defineMiddleware(async ({ locals }, next) => {
  Object.assign(locals, {
    datocmsEnvironment,
    datocmsToken: DATOCMS_READONLY_API_TOKEN
  });
  const response = await next();
  return response;
});
