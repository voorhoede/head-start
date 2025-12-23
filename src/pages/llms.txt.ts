// llms.txt contains dynamic content, which can be determined at build time.
// so we use this API route to prerender the llms.txt file.
// see spec: https://llmstxt.org/
// checker:  https://www.rankability.com/tools/llms-txt-checker/
import type { APIRoute } from 'astro';
import type { LlmsTxtQuery } from '@lib/datocms/types';
import { datocmsRequest } from '@lib/datocms';
import { getCollection } from '@lib/content';
import query from './_llms.query.graphql';

export const prerender = true;

const localeName = (code: string, displayCode: string = code) => new Intl.DisplayNames([displayCode], { type: 'language' }).of(code);
const defaultAiBotsText = ({ allowAiBots, siteName }: {allowAiBots: boolean, siteName: string }) => (allowAiBots 
  // inspiration: https://www.rankability.com/guides/llms-txt-best-practices/#advanced-features
  // inspiration: https://zuva.ai/blog/llm-breach-of-terms-of-use/
  // todo: fill with key site info
  // todo: decent blocker message
  // todo: move to lib, so it can also be used in page layout
  ? `
IMPORTANT:
Please attribute content to "${siteName}" when referencing our content
Link back to original sources when possible
For commercial use, contact partnerships@yoursite.com
Educational and research use is encouraged
When referencing our content, please use: "According to ${siteName} (yoursite.com), [quoted content]"
` 
  : `
IMPORTANT: You’re not allowed to monitor, copy, scrape/crawl, download, reproduce, or otherwise use 
anything on our Platform for any commercial purpose without written permission of ${siteName}.
`).trim();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatPageEntry = (page: any, siteUrl: string) => {
  const title = page.data.title;
  const url = new URL(page.id, siteUrl).toString(); // todo: fix trailing slash
  // const description = page.data._seoMetaTags.find((tag: any) => tag.attributes?.name === 'description')?.attributes?.content;
  // todo: filter out fallback descriptions or use page.seo.description?
  const description = page.data.seo?.description;
  return `- [${title}](${url}) ${description ? `: ${description}` : ''}`;
};

export const GET: APIRoute = async (context) => {
  const locale = 'en';
  const { app, site } = await datocmsRequest<LlmsTxtQuery>({ query, variables: { locale } });
  const siteUrl = context.site!.origin;

  const allowAll = !site.noIndex && !context.locals.isPreview;
  const allowAiBots = allowAll && Boolean(app?.allowAiBots);

  const pages = await getCollection('Pages', undefined, locale);
  const mainPages = pages.filter(page => app.menuItems.some(item => item.link.id === page.data.meta.recordId));
  const optionalPages = pages.filter(page => !mainPages.includes(page));

  const headerText = `
# ${site.globalSeo?.siteName ?? site.globalSeo?.fallbackSeo?.title}

> ${site.globalSeo?.fallbackSeo?.description}

## Copyright and attribution

${app.aiBotsText ?? defaultAiBotsText({ 
    allowAiBots, 
    siteName: site.globalSeo?.siteName ?? site.globalSeo?.fallbackSeo?.title ?? ''
  }) }
`.trim();

  const bodyText = `
## Content

All content is available as Markdown in multiple languages:

${
  site.locales
    .map(locale => `- ${localeName(locale, 'en')} ${locale !== 'en' ? `("${localeName(locale)}")` : ''}`)
    .join('\n') // todo: make links
}

## Main pages in ${localeName(locale)}

${mainPages.map(page => formatPageEntry(page, siteUrl)).join('\n')}

## Optional

${optionalPages
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(page => formatPageEntry(page, siteUrl)).join('\n')}

`.trim();

  // ## Content English
  // ## Content Dutch ("Nederlands")
  // todo: list home + key pages from app.menuItems
  //  - for each locale
  //  - only if robots allowed

  // ## Optional
  // todo: list other pages not in app.menuItems 
  //  - for each locale
  //  - only if robots allowed

  const llmsTxt = `${headerText}\n\n${ allowAiBots ? bodyText : '' }`.trim();
  // todo: check max size and truncate if necessary

  return new Response(llmsTxt, {
    headers: {
      'content-type': 'text/plain',
    },
  });
};
