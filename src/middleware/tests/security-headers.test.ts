import { describe, it, expect, vi } from 'vitest';
import type { APIContext } from 'astro';
import { securityheaders } from '../security-headers';

describe('securityheaders middleware', () => {
  it('adds security headers to the response', async () => {
    // Mock a minimal Astro middleware context
    const mockRequest = new Request('https://example.com');
    const mockContext = {
      request: mockRequest,
      params: {},
    } as APIContext;

    // Mock next() to return a Response without the headers
    const response = new Response('OK');
    const next = vi.fn().mockResolvedValue(response);

    const finalResponse = await securityheaders(mockContext, next);

    const expectedHeaders = {
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
    };

    expect(finalResponse).toBeInstanceOf(Response);
    // Make sure all expected headers are set
    for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
      expect(finalResponse?.headers.get(key)).toBe(expectedValue);
    }
  });

  it('does not override existing headers', async () => {
    const mockRequest = new Request('https://example.com');
    const mockContext = {
      request: mockRequest,
      params: {},
    } as APIContext;

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
