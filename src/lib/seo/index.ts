import type { Tag } from '~/lib/datocms/types';
import { getLocale } from '~/lib/i18n';
import { globalSeo } from '~/lib/site.json';
import aiRobotsTxt from './ai.robots.txt?raw';

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

export type LlmsTxtItem = {
  title: string;
  url?: string;
  description?: string;
  children?: LlmsTxtItem[];
};

export type LlmsTxtProps = {
  siteName: string;
  siteSummary: string;
  intro: string;
  allowAiBots: boolean;
  items: LlmsTxtItem[];
};

const renderItems = (items: LlmsTxtItem[], depth = 0): string[] => {
  return items.flatMap((item) => {
    const indent = '  '.repeat(depth);
    const label = item.url ? `[${item.title}](${item.url})` : item.title;
    const line = item.description
      ? `${indent}- ${label}: ${item.description}`
      : `${indent}- ${label}`;
    return [line, ...renderItems(item.children ?? [], depth + 1)];
  });
};

export const llmsTxt = ({
  siteName,
  siteSummary,
  intro,
  allowAiBots,
  items,
}: LlmsTxtProps): string => {
  const blocks: string[] = [`# ${siteName}`];

  if (siteSummary) {
    blocks.push(`> ${siteSummary}`);
  }

  if (intro) {
    blocks.push(intro.replaceAll('${siteName}', siteName));
  }

  if (allowAiBots && items.length > 0) {
    blocks.push(['## Pages', '', ...renderItems(items)].join('\n'));
  }

  return blocks.join('\n\n');
};
