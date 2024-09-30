import type { Tag } from '../datocms/datocms';
import { getLocale } from '../i18n';
import type { SiteLocale } from '../i18n/i18n.types';
import { globalSeo } from '../site.json';

export type PageUrl = {
  locale: SiteLocale,
  pathname: string,
};

const locale = getLocale();

export const siteName = globalSeo[locale as keyof typeof globalSeo].siteName;
export const titleSuffix = globalSeo[locale as keyof typeof globalSeo].titleSuffix;

export const noIndexTag: Tag = {
  attributes: { name: 'robots' },
  content: 'noindex',
  tag: 'meta',
};

export const titleTag = (title:string): Tag => ({
  tag: 'title',
  content: `${title} ${titleSuffix}`,
});
