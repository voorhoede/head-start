import type { SiteLocale } from '~/lib/datocms/types';
import { getLocale } from '~/lib/i18n';

export const getAskPathname = (locale: SiteLocale = getLocale()) => `/${locale}/ask/`;
