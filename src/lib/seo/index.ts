import type { Tag } from '@lib/datocms/types';
import { getLocale } from '@lib/i18n';
import type { SiteLocale } from '@lib/i18n/types';
import { globalSeo } from '@lib/site.json';
import aiRobotsTxt from './ai.robots.txt?raw';

export type PageUrl = {
  locale: SiteLocale,
  pathname: string,
};

/** 
  * `globalSeo` _should_ have a key per available locale. When there is only one
  * locale configured in Dato, that key is missing. Therefore we fallback to the
  * `globalSeo` object 
  */
const localeSeo = () => {
  const locale = getLocale();
  const localeSeoData = globalSeo[locale as keyof typeof globalSeo];
  return localeSeoData || globalSeo;
};

export const siteName: () => string = () => localeSeo().siteName;
export const titleSuffix: () => string = () => localeSeo().titleSuffix;

export const noIndexTag: Tag = {
  attributes: { name: 'robots' },
  content: 'noindex',
  tag: 'meta',
};

export const titleTag = (title: string): Tag => ({
  tag: 'title',
  content: `${title} ${titleSuffix()}`,
});

export type RobotsTxtProps = {
  allowAiBots: boolean,
  allowAll: boolean,
  siteUrl: string,
}

export const robotsTxt = ({ allowAiBots, allowAll, siteUrl }: RobotsTxtProps) => `
${allowAiBots ? '' : aiRobotsTxt}

User-agent: *
${allowAll ? 'Allow: /' : 'Disallow: /'}

Sitemap: ${siteUrl}/sitemap-index.xml

`.trim();
