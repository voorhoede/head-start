import { describe, expect, test, vi } from 'vitest';
import { defaultRedirectStatus, redirectStatusCode } from './redirects';

vi.mock('./redirects.json', () => (
  {
    default: [
      {
        from: '/redirect-placeholder/:slug/',
        to: '/en/:slug/',
        statusCode: '302',
      },
      {
        from: '/redirect-wildcard/*',
        to: '/en/:splat/',
        statusCode: '302',
      },
      {
        from: '/redirect-order/static-slug/',
        to: '/nl/gedeeltelijke-pagina-layouts/',
        statusCode: '302',
      },
      {
        from: '/redirect-order/*',
        to: '/nl/',
        statusCode: '302',
      },
    ]
  }
));


describe('redirects:', () => {
  test('redirectStatusCode returns valid redirect status', () => {
    const validStatusCodes = [301, 302, 303, 307, 308];
    validStatusCodes.forEach(
      (statusCode) => {
        expect(redirectStatusCode(statusCode)).toBe(statusCode);
      }
    );
    const invalidStatusCodes = [100, 200, 304, 400, 500, 999];
    invalidStatusCodes.forEach(
      (statusCode) => {
        expect(redirectStatusCode(statusCode)).toBe(defaultRedirectStatus);
      });
  });
});
