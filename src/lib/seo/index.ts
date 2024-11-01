import type { Tag } from '@lib/datocms/datocms';
import { getLocale } from '@lib/i18n';
import type { SiteLocale } from '@lib/i18n/i18n.types';
import { globalSeo } from '@lib/site.json';

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
