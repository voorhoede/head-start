import type { ValidRedirectStatus } from 'astro';
import { parse, inject } from 'regexparam';
import redirectConfiguration from './redirects.json';

export const defaultRedirectStatus = 302;

interface getPathParamsInput {
  pathname: string;
  pattern: RegExp;
  keys: string[];
}

interface ParamsOutput {
  [key: string]: string | null;
}

export const redirectStatusCode = (statusCode: number): ValidRedirectStatus => {
  switch (statusCode) {
  case 301:
  case 302:
  case 303:
  case 307:
  case 308:
    return statusCode;
  default:
    return defaultRedirectStatus;
  }
};

/**
 * Extracts parameters from a pathname using a pattern and keys.
 * Example:
 *   getPathParams({ pathname: '/blog/123', pattern: /^\/blog\/(\d+)$/, keys: ['id'] })
 *   // Returns: { id: '123' }
 */
const getPathParams = ({
  pathname,
  pattern,
  keys,
}: getPathParamsInput): ParamsOutput => {
  const matches = pattern.exec(pathname);
  const params = keys.reduce<ParamsOutput>((out, key, index) => {
    out[key] = matches?.[index + 1] || null;
    return out;
  }, {});

  // we used to support Netlify- and Cloudflare-style patterns which use a :splat for wildcard placeholders
  params.splat = params['*'];

  return params;
};

const redirectRules = redirectConfiguration.map((rule) => {
  const { keys, pattern } = parse(rule.from);
  const statusCode = redirectStatusCode(Number(rule.statusCode));
  return {
    from: rule.from,
    to: rule.to,
    statusCode,
    keys,
    pattern,
  };
});

/**
 * Returns matching redirect rule for a given pathname.
 * The pathname must start with a slash (/...).
 */
export const getRedirectTarget = (pathname: string) => {
  const matchingRule = redirectRules.find((rule) =>
    rule.pattern.test(pathname),
  );
  if (!matchingRule) return;

  const params = getPathParams({
    pathname,
    pattern: matchingRule.pattern,
    keys: matchingRule.keys,
  });

  const output = {
    url: inject(matchingRule.to, params),
    statusCode: matchingRule.statusCode,
  };
  return output;
};
