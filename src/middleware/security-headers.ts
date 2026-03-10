import { defineMiddleware } from 'astro:middleware';

/**
 * Security Headers:
 * ⚠️ These headers are only applied to runtime responses, so keep these rules in sync 
 *    with their static counterparts in public/_headers
 * 
 * Can be teste with: https://securityheaders.com/
 */
export const securityheaders = defineMiddleware(async (_, next) => {
  const response = await next();
  const headers: Record<string, string> = {
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
  };
  // Allow DatoCMS Web Previews plugin to embed the site; omit X-Frame-Options so CSP applies
  headers['Content-Security-Policy'] = 'frame-ancestors \'self\' https://plugins-cdn.datocms.com';
  
  // Apply security headers to the response if they are not already set
  for (const [key, value] of Object.entries(headers)) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }
  return response;
});
