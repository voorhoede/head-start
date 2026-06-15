import type { APIRoute } from 'astro';
import { getApp } from '~/lib/app';
import { htmlToMarkdown } from '~/lib/markdown';

export const prerender = false;

const cache = new Map<string, { md: string; noindex: boolean; timestamp: number }>();
const CACHE_TTL = 60000 * 5;
const MAX_CACHE_SIZE = 500;

export const GET: APIRoute = async ({ params, site, locals }) => {
  const app = await getApp();
  if (!app.allowAiBots || app.noIndex || locals.isPreview) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  params.path ||= '';

  const cached = cache.get(params.path);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    const headers: Record<string, string> = {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': `private, max-age=${CACHE_TTL / 1000}`,
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
  let response: Response;
  try {
    response = await fetch(pageUrl, {
      headers: { Accept: 'text/html' },
      signal: AbortSignal.timeout(10_000),
      redirect: 'manual',
    });
  } catch {
    return new Response('Upstream timeout', {
      status: 504,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (response.status !== 200) {
    const status = response.type === 'opaqueredirect' ? 404 : response.status;
    return new Response(status === 404 ? 'Not found' : 'Upstream error', {
      status,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const html = await response.text();

  let noindex: boolean;
  let md: string;

  try {
    const localeCode = params.path.split('/')[0] || undefined;
    ({ md, noindex } = await htmlToMarkdown(html, { url: pageUrl.href, localeCode }));
  } catch {
    return new Response('Unable to process page content', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (cache.size >= MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, entry] of cache) {
      if (now - entry.timestamp >= CACHE_TTL) cache.delete(key);
    }
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) cache.delete(oldestKey);
    }
  }

  if (noindex) {
    return new Response(md, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  cache.set(params.path, { md, noindex, timestamp: Date.now() });

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': `private, max-age=${CACHE_TTL / 1000}`,
    },
  });
};
