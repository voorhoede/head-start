import { describe, it, expect, vi } from 'vitest';
import type { APIContext } from 'astro';
import { securityheaders } from '../security-headers';

const createContext = (url: string) => ({
  request: new Request(url),
  url: new URL(url),
  params: {},
}) as APIContext;

describe('securityheaders middleware', () => {
  it('adds security headers to the response', async () => {
    const mockContext = createContext('https://example.com');

    // Mock next() to return a Response without the headers
    const response = new Response('OK');
    const next = vi.fn().mockResolvedValue(response);

    const finalResponse = await securityheaders(mockContext, next);

    const expectedHeaders = {
      'Content-Security-Policy': 'frame-ancestors \'self\' https://*.admin.datocms.com https://plugins-cdn.datocms.com',
      'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
    };

    expect(finalResponse).toBeInstanceOf(Response);
    // Make sure all expected headers are set
    for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
      expect(finalResponse?.headers.get(key)).toBe(expectedValue);
    }
    // Regular pages may be indexed
    expect(finalResponse?.headers.has('X-Robots-Tag')).toBe(false);
  });

  it('lets any DatoCMS host frame the editor guide and keeps it out of search engines', async () => {
    for (const path of ['/cms/editor-guide/', '/cms/editor-guide']) {
      const mockContext = createContext(`https://example.com${path}`);
      const next = vi.fn().mockResolvedValue(new Response('OK'));

      const finalResponse = await securityheaders(mockContext, next);

      expect(finalResponse?.headers.get('Content-Security-Policy')).toBe('frame-ancestors \'self\' https://*.datocms.com');
      expect(finalResponse?.headers.get('X-Robots-Tag')).toBe('noindex');
      expect(finalResponse?.headers.get('Permissions-Policy')).toBe('camera=(), geolocation=(), microphone=(), payment=(), usb=()');
    }
  });

  it('does not override existing headers', async () => {
    const mockContext = createContext('https://example.com');

    const response = new Response('OK', {
      headers: {
        'X-Frame-Options': 'DENY', // Simulate an already-set header
      },
    });
    const next = vi.fn().mockResolvedValue(response);

    const finalResponse = await securityheaders(mockContext, next);

    expect(finalResponse).toBeInstanceOf(Response);
    // Make sure existing header is preserved
    expect(finalResponse?.headers.get('X-Frame-Options')).toBe('DENY');
    // Make sure others are still added
    expect(finalResponse?.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
