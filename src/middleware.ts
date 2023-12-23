import { defineMiddleware, sequence } from 'astro/middleware';
import { setLocale } from './lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';

const i18n = defineMiddleware(async ({ params }, next) => {
  if (params.locale) {
    setLocale(params.locale as SiteLocale);
  }
  return next();
});

export const onRequest = sequence(i18n);
