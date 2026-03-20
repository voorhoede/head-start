import { defineMiddleware } from 'astro:middleware';

/**
 * Security Headers:
 * ⚠️ These headers are only applied to runtime responses, so keep these rules in sync 
 *    with their static counterparts in public/_headers
 * 
 * Can be teste with: https://securityheaders.com/
 */
export const securityheaders = defineMiddleware(async (context, next) => {
  const response = await next();
  const isSelfGuide = context.url.pathname === '/self-guide/' || context.url.pathname === '/self-guide';
  const headers: Record<string, string> = {
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
  };

  // Allow DatoCMS to embed the self-guide page in an iframe
  if (isSelfGuide) {
    headers['X-Frame-Options'] = 'ALLOW-FROM https://*.datocms.com';
    headers['Content-Security-Policy'] = 'frame-ancestors \'self\' https://*.datocms.com';
  }

  // Apply security headers to the response if they are not already set
  for (const [key, value] of Object.entries(headers)) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }
  return response;
});
