import { describe, it, expect, vi } from 'vitest';
import type { APIContext } from 'astro';
import { linkheaders } from '../link-headers';

describe('linkheaders middleware', () => {
  it('adds a Link header advertising llms.txt via describedby', async () => {
    const mockContext = {
      request: new Request('https://example.com'),
      url: new URL('https://example.com'),
      params: {},
    } as APIContext;

    const next = vi.fn().mockResolvedValue(new Response('OK'));

    const finalResponse = await linkheaders(mockContext, next);

    expect(finalResponse).toBeInstanceOf(Response);
    expect(finalResponse?.headers.get('Link')).toBe(
      '</llms.txt>; rel="describedby"; type="text/plain"',
    );
  });

  it('does not override an existing Link header', async () => {
    const mockContext = {
      request: new Request('https://example.com'),
      url: new URL('https://example.com'),
      params: {},
    } as APIContext;

    const response = new Response('OK', {
      headers: { Link: '</custom>; rel="preload"' },
    });
    const next = vi.fn().mockResolvedValue(response);

    const finalResponse = await linkheaders(mockContext, next);

    expect(finalResponse?.headers.get('Link')).toBe('</custom>; rel="preload"');
  });
});
