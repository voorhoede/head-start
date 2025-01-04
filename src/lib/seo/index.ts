import type { Tag } from '@lib/datocms/types';
import { getLocale } from '@lib/i18n';
import type { SiteLocale } from '@lib/i18n/types';
import { globalSeo } from '@lib/site.json';
import aiRobotsTxt from './ai.robots.txt';

export type PageUrl = {
  locale: SiteLocale,
  pathname: string,
};

export const siteName = () => {
  const locale = getLocale();
  const localeSeo = globalSeo[locale as keyof typeof globalSeo];

  return localeSeo.siteName;
};

export const titleSuffix = () => {
  const locale = getLocale();
  const localeSeo = globalSeo[locale as keyof typeof globalSeo];

  return localeSeo.titleSuffix;
};

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
