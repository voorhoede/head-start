import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIContext } from 'astro';

const getApp = vi.fn();
vi.mock('~/lib/app', () => ({ getApp: () => getApp() }));

const { markdownNegotiation } = await import('../markdown-negotiation');

interface ContextOptions {
  accept?: string;
  method?: string;
  isPreview?: boolean;
}

function context({ accept, method = 'GET', isPreview = false }: ContextOptions = {}) {
  const headers = new Headers();
  if (accept) headers.set('accept', accept);
  const request = new Request('https://example.com/en/about/', { method, headers });
  return {
    request,
    url: new URL(request.url),
    params: {},
    locals: { isPreview },
  } as unknown as APIContext;
}

const html = '<!doctype html><html><head><title>About</title></head><body><main><h1>About</h1><p>Hi</p></main></body></html>';
const htmlResponse = () => new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

describe('markdownNegotiation middleware', () => {
  beforeEach(() => {
    getApp.mockReset();
    getApp.mockResolvedValue({ allowAiBots: true, noIndex: false });
  });

  it('returns markdown when the client accepts text/markdown', async () => {
    const next = vi.fn().mockResolvedValue(htmlResponse());
    const response = await markdownNegotiation(context({ accept: 'text/markdown' }), next);

    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('Vary')?.toLowerCase()).toContain('accept');
    expect(Number(response.headers.get('x-markdown-tokens'))).toBeGreaterThan(0);
    expect(Number(response.headers.get('x-original-tokens'))).toBeGreaterThan(0);
    expect(await response.text()).toContain('# About');
  });

  it('keeps HTML for browsers but advertises negotiation via Vary', async () => {
    const next = vi.fn().mockResolvedValue(htmlResponse());
    const response = await markdownNegotiation(
      context({ accept: 'text/html,application/xhtml+xml,*/*' }),
      next,
    );

    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('Vary')?.toLowerCase()).toContain('accept');
    expect(await response.text()).toBe(html);
  });

  it('does not negotiate when AI bots are disallowed', async () => {
    getApp.mockResolvedValue({ allowAiBots: false, noIndex: false });
    const next = vi.fn().mockResolvedValue(htmlResponse());
    const response = await markdownNegotiation(context({ accept: 'text/markdown' }), next);

    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('Vary')).toBeNull();
  });

  it('does not negotiate in preview mode', async () => {
    const next = vi.fn().mockResolvedValue(htmlResponse());
    const response = await markdownNegotiation(
      context({ accept: 'text/markdown', isPreview: true }),
      next,
    );

    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  });

  it('ignores non-HTML and non-200 responses', async () => {
    const json = new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    const response = await markdownNegotiation(
      context({ accept: 'text/markdown' }),
      vi.fn().mockResolvedValue(json),
    );
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(getApp).not.toHaveBeenCalled();
  });

  it('treats q=0 as not acceptable', async () => {
    const next = vi.fn().mockResolvedValue(htmlResponse());
    const response = await markdownNegotiation(context({ accept: 'text/markdown;q=0' }), next);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  });
});
