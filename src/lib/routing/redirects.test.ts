import { describe, expect, test, vi } from 'vitest';
import { defaultRedirectStatus, getRedirectTarget, redirectStatusCode } from './redirects';

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
        to: '/en/:splat',
        statusCode: '302',
      },
      {
        from: '/redirect-order/static-slug/',
        to: '/nl/static/',
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
  describe('redirectStatusCode returns valid redirect status:', () => {
    const validStatusCodes = [301, 302, 303, 307, 308];
    validStatusCodes.forEach((statusCode) =>
      test(`${statusCode} returns valid ${statusCode}`, () => {
        expect(redirectStatusCode(statusCode)).toBe(statusCode);
      })
    );
    const invalidStatusCodes = [100, 200, 304, 400, 500, 999];
    invalidStatusCodes.forEach((statusCode) =>
      test(`${statusCode} returns default ${defaultRedirectStatus}`, () => {
        expect(redirectStatusCode(statusCode)).toBe(defaultRedirectStatus);
      })
    );
  });

  describe('getRedirectPaths returns valid redirect payload', () => {
    [
      { from: '/foo', to: undefined },
      { from: '/redirect-placeholder/', to: undefined },
      { from: '/redirect-placeholder/bar/', to: '/en/bar/' },
      { from: '/redirect-wildcard/', to: '/en/:splat' }, // This is an issue with regexparams inject
      { from: '/redirect-wildcard/foo/bar/baz/', to: '/en/foo/bar/baz/' },
      { from: '/redirect-order/', to: '/nl/' },
      { from: '/redirect-order/static-slug', to: '/nl/static/' },
      { from: '/redirect-order/wildcard-slug', to: '/nl/' },
    ].forEach(({ from, to }) => {
      test(`Would redirect ${from} to ${to}`, () => {
        const { url } = getRedirectTarget(from) || {};
        expect(url).toBe(to);
      });
    });
  });

});
