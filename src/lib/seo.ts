import type { Tag } from './types/datocms';
import { getLocale } from './i18n';
import { globalSeo } from './site.json';
import type { SiteLocale } from './i18n.types';

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
