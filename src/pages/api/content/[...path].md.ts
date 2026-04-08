import type { APIRoute } from 'astro';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { getEntry } from '~/lib/content';
import { buildFrontmatter } from '~/lib/frontmatter';
import type { Alternate } from '~/lib/frontmatter';
import type { PageMeta } from '~/lib/rehype/rehype-extract-meta';
import rehypeExtractMeta from '~/lib/rehype/rehype-extract-meta';
import rehypeExtractNoindex from '~/lib/rehype/rehype-extract-noindex';
import rehypeExtractAlternates from '~/lib/rehype/rehype-extract-alternates';
import rehypeExtractMain from '~/lib/rehype/rehype-extract-main';

export const prerender = false;

const entry = await getEntry('App', 'default');

const cache = new Map<string, { md: string; noindex: boolean; timestamp: number }>();
const CACHE_TTL = 60000 * 5;
const MAX_CACHE_SIZE = 500;

export const GET: APIRoute = async ({ params, site }) => {
  if (!entry?.data.allowAiBots) {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
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

  if (!site) {
    return new Response('Site URL is not configured', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const pageUrl = new URL(site);
  pageUrl.pathname = params.path ? `/${params.path}/` : '/';
  const response = await fetch(pageUrl, {
    headers: { Accept: 'text/html' },
  });
  
  if (response.status !== 200) {
    return new Response(null, { status: response.status });
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
      .use(rehypeExtractMeta)
      .use(rehypeExtractNoindex)
      .use(rehypeExtractAlternates)
      .use(rehypeExtractMain)
      .use(rehypeRemark)
      .use(remarkGfm)
      .use(remarkStringify)
      .process(html);

    noindex = Boolean(result.data.noindex);
    const alternates = (result.data.alternates ?? []) as Alternate[];
    const meta = (result.data.meta ?? {}) as PageMeta;
    const frontmatter = buildFrontmatter({ meta, url: pageUrl.href, alternates });
    md = frontmatter + String(result);
  } catch (error) {
    return new Response(`Unable to render markdown: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  
  if (cache.size >= MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, cacheEntry] of cache) {
      if (now - cacheEntry.timestamp >= CACHE_TTL) cache.delete(key);
    }
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }
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
