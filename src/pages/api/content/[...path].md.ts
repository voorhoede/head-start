import type { APIRoute } from 'astro';
import type { RobotsTxtQuery } from '~/lib/datocms/types';
import type { Root } from 'hast';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { select } from 'hast-util-select';
import { datocmsRequest } from '~/lib/datocms';
import query from '../../_robots.query.graphql';

export const prerender = false;

const cache = new Map<string, { md: string; timestamp: number }>();
const CACHE_TTL = 60000 * 5;

export const GET: APIRoute = async ({ params, site, locals }) => {
  const { app, site: datoSite } = await datocmsRequest<RobotsTxtQuery>({ query });
  const allowAll = !datoSite.noIndex && !locals.isPreview;
  const allowAiBots = allowAll && Boolean(app?.allowAiBots);
  
  if (!allowAiBots) {
    return new Response(null, { status: 404 });
  }
  
  params.path ||= '';
  
  const cached = cache.get(params.path);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(cached.md, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  const pageUrl = new URL(`/${params.path}/`, site);
  const response = await fetch(pageUrl, {
    headers: { Accept: 'text/html' },
  });
  
  if (response.status !== 200) {
    return response;
  }
  
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return new Response(null, { status: 404 });
  }

  const html = await response.text();

  const md = await unified()
    .use(rehypeParse)
    .use(() => (tree: Root) => {
      const main = select('main', tree);
      if (main) {
        tree.children = main.children;
      }
    })
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);
  
  cache.set(params.path, { md: String(md), timestamp: Date.now() });

  return new Response(String(md), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
