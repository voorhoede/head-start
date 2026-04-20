import type { APIRoute } from 'astro';
import type { RobotsTxtQuery } from '~/lib/datocms/types';
import type { Root } from 'hast';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { select } from 'hast-util-select';
import { datocmsRequest } from '~/lib/datocms';
import query from '../../_robots.query.graphql';

export const prerender = false;

const cache = new Map<string, { md: string; noindex: boolean; timestamp: number }>();
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
    const headers: Record<string, string> = {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    };
    if (cached.noindex) {
      headers['X-Robots-Tag'] = 'noindex';
    }
    return new Response(cached.md, { headers });
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

  let noindex = false;
  let md: string;

  try {
    const result = await unified()
      .use(rehypeParse)
      .use(() => (tree: Root) => {
        const robotsMeta = select('meta[name="robots"]', tree);
        const robotsContent = robotsMeta?.properties?.content;
        if (typeof robotsContent === 'string' && robotsContent.includes('noindex')) {
          noindex = true;
        }

        const main = select('main', tree);
        if (main) {
          tree.children = main.children;
        }
      })
      .use(rehypeRemark)
      .use(remarkGfm)
      .use(remarkStringify)
      .process(html);

    md = String(result);
  } catch (error) {
    return new Response(`Unable to render markdown: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  
  cache.set(params.path, { md, noindex, timestamp: Date.now() });

  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  };
  if (noindex) {
    headers['X-Robots-Tag'] = 'noindex';
  }

  return new Response(md, { headers });
};
