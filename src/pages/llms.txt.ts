import type { APIRoute } from 'astro';
import { datocmsRequest } from '~/lib/datocms';
import type { LlmsTxtQuery } from '~/lib/datocms/types';
import { defaultLocale } from '~/lib/i18n';
import { getHref } from '~/lib/routing';
import { llmsTxt, type LlmsTxtItem } from '~/lib/seo';
import query from './_llms.query.graphql';

export const prerender = true;

type RawMenuItem = {
  __typename?: string;
  internalTitle?: string | null;
  internalLink?: {
    __typename?: string;
    title?: string;
    seo?: { description?: string | null } | null;
  } | null;
  title?: string;
  link?: string;
  items?: RawMenuItem[];
};

const buildItem = (raw: RawMenuItem, siteUrl: string): LlmsTxtItem | null => {
  if (raw.__typename === 'MenuItemInternalRecord') {
    const link = raw.internalLink;
    if (!link) return null;
    const url = `${siteUrl}${getHref({ locale: defaultLocale, record: link as Parameters<typeof getHref>[0]['record'] })}`;
    const description = link.seo?.description ?? undefined;
    const title = raw.internalTitle || link.title || '';
    return { title, url, description };
  }
  if (raw.__typename === 'MenuItemExternalRecord') {
    if (!raw.link) return null;
    return { title: raw.title ?? '', url: raw.link };
  }
  if (raw.__typename === 'MenuItemGroupRecord') {
    const children = (raw.items ?? [])
      .map((child) => buildItem(child, siteUrl))
      .filter((c): c is LlmsTxtItem => c !== null);
    return { title: raw.title ?? '', children };
  }
  return null;
};

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
  const items: LlmsTxtItem[] = (app?.menuItems ?? [])
    .map((item) => buildItem(item as RawMenuItem, siteUrl))
    .filter((i): i is LlmsTxtItem => i !== null);

  return new Response(
    llmsTxt({
      siteName: site.globalSeo?.siteName ?? '',
      siteSummary: site.globalSeo?.fallbackSeo?.description ?? '',
      intro: app?.llmsIntro ?? '',
      allowAiBots: Boolean(app?.allowAiBots),
      items,
    }),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
};
