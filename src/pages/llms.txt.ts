import type { APIRoute } from 'astro';
import { datocmsRequest } from '~/lib/datocms';
import type { LlmsTxtQuery } from '~/lib/datocms/types';
import { defaultLocale } from '~/lib/i18n';
import { getHref } from '~/lib/routing';
import { llmsTxt, type LlmsTxtPage } from '~/lib/seo';
import query from './_llms.query.graphql';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const { app, site } = await datocmsRequest<LlmsTxtQuery>({
    query,
    variables: { locale: defaultLocale },
  });

  const allowAll = !site.noIndex && !context.locals.isPreview;
  if (!allowAll) {
    return new Response('Not Found', { status: 404 });
  }

  const siteUrl = context.site!.origin;
  const pages: LlmsTxtPage[] = [];
  for (const item of app?.menuItems ?? []) {
    if (item.__typename !== 'MenuItemInternalRecord') continue;
    const link = item.internalLink;
    if (!link) continue;
    const url = getHref({ locale: defaultLocale, record: link });
    const description =
      link.__typename === 'PageRecord' && link.seo?.description
        ? link.seo.description
        : undefined;
    pages.push({ title: item.title ?? '', url, description });
  }

  return new Response(
    llmsTxt({
      siteName: site.globalSeo?.siteName ?? '',
      siteSummary: site.globalSeo?.fallbackSeo?.description ?? '',
      intro: app?.llmsIntro ?? '',
      allowAiBots: Boolean(app?.allowAiBots),
      pages,
      siteUrl,
    }),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
};
