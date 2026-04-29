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

export type LlmsTxtPage = {
  title: string;
  url: string;
  description?: string;
};

export type LlmsTxtProps = {
  siteName: string;
  siteSummary: string;
  intro: string;
  allowAiBots: boolean;
  pages: LlmsTxtPage[];
  siteUrl: string;
};

export const llmsTxt = ({
  siteName,
  siteSummary,
  intro,
  allowAiBots,
  pages,
  siteUrl,
}: LlmsTxtProps): string => {
  const blocks: string[] = [`# ${siteName}`];

  if (siteSummary) {
    blocks.push(`> ${siteSummary}`);
  }

  if (intro) {
    blocks.push(intro.replaceAll('${siteName}', siteName));
  }

  if (allowAiBots && pages.length > 0) {
    const lines = pages.map((page) => {
      const href = `${siteUrl}${page.url}`;
      return page.description
        ? `- [${page.title}](${href}): ${page.description}`
        : `- [${page.title}](${href})`;
    });
    blocks.push(['## Pages', '', ...lines].join('\n'));
  }

  return blocks.join('\n\n');
};
