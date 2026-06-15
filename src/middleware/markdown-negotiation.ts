import { defineMiddleware } from 'astro:middleware';
import { getApp } from '~/lib/app';
import { estimateTokens, htmlToMarkdown } from '~/lib/markdown';

/**
 * Does the `Accept` header explicitly ask for Markdown?
 * Only an explicit `text/markdown` media range counts; a wildcard `*` range
 * (sent by browsers) or `text/*` does not, so HTML stays the default.
 */
function acceptsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  return accept.split(',').some((part) => {
    const [media, ...params] = part.trim().split(';');
    if (media.trim().toLowerCase() !== 'text/markdown') return false;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    return !q || parseFloat(q.slice(2)) > 0;
  });
}

/** Append a field to the `Vary` header without clobbering existing values. */
function appendVary(headers: Headers, value: string): void {
  const existing = headers.get('Vary');
  if (!existing) {
    headers.set('Vary', value);
    return;
  }
  const present = existing.split(',').some((v) => v.trim().toLowerCase() === value.toLowerCase());
  if (!present) {
    headers.set('Vary', `${existing}, ${value}`);
  }
}

/**
 * Markdown content negotiation:
 * Agents that send `Accept: text/markdown` receive a Markdown rendition of the
 * page; browsers (and anything else) keep the default HTML. Negotiable pages
 * advertise this with `Vary: accept` so caches store both representations.
 *
 * @see https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */
export const markdownNegotiation = defineMiddleware(async ({ request, locals }, next) => {
  const response = await next();

  // Only successful HTML page responses have a Markdown counterpart.
  const contentType = response.headers.get('content-type') ?? '';
  if (request.method !== 'GET' || response.status !== 200 || !contentType.includes('text/html')) {
    return response;
  }

  // Honour the same AI-access gating as the `/api/content/*.md` route.
  const app = await getApp();
  if (!app.allowAiBots || app.noIndex || locals.isPreview) {
    return response;
  }

  // The page is negotiable, so advertise it even when HTML is served.
  appendVary(response.headers, 'accept');

  if (!acceptsMarkdown(request.headers.get('accept'))) {
    return response;
  }

  const html = await response.text();
  let md: string;
  let noindex: boolean;
  try {
    const url = new URL(request.url);
    const localeCode = url.pathname.split('/')[1] || undefined;
    ({ md, noindex } = await htmlToMarkdown(html, { url: url.href, localeCode }));
  } catch {
    // Conversion failed — fall back to the original HTML (body already read).
    return new Response(html, { status: response.status, headers: response.headers });
  }

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('x-markdown-tokens', String(estimateTokens(md)));
  headers.set('x-original-tokens', String(estimateTokens(html)));
  headers.delete('Content-Length');
  if (noindex) {
    headers.set('X-Robots-Tag', 'noindex');
    headers.set('Cache-Control', 'no-store');
  }

  return new Response(md, { status: 200, headers });
});
