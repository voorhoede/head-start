import { defineMiddleware, sequence } from 'astro/middleware';
import { setLocale } from './lib/i18n';

const i18n = defineMiddleware(async ({ params }, next) => {
  if (params.locale) {
    setLocale(params.locale);
  }
  return next();
});

export const onRequest = sequence(i18n);
