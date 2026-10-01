import { defineMiddleware } from 'astro:middleware';

/**
 * Security Headers:
 * ⚠️ Prerendered pages get these headers too, but files that are not pages (such as /_astro/*) do not.
 * 
 * Can be teste with: https://securityheaders.com/
 */
export const securityheaders = defineMiddleware(async (context, next) => {
  const response = await next();
  const isEditorGuide =
    context.url.pathname === '/cms/editor-guide/' ||
    context.url.pathname === '/cms/editor-guide';
  const headers: Record<string, string> = {
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
  };
  headers['Content-Security-Policy'] = 'frame-ancestors \'self\' https://*.admin.datocms.com https://plugins-cdn.datocms.com';

  if (isEditorGuide) {
    headers['X-Robots-Tag'] = 'noindex';
  }

  // Apply security headers to the response if they are not already set
  for (const [key, value] of Object.entries(headers)) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }
  return response;
});
