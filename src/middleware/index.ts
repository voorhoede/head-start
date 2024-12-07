import {  sequence } from 'astro:middleware';

import { datocms } from './datocms';
import { i18n } from './i18n';
import { preview } from './preview';
import { proxyFiles } from './proxy-files';
import { redirects } from './redirects';

export const onRequest = sequence(
  datocms,
  i18n,
  preview,
  proxyFiles,
  redirects
);
