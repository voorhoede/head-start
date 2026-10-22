import { defineMiddleware } from 'astro:middleware';

/**
 * Security headers for runtime (on-demand rendered) responses.
 * ⚠️ Static files get their headers from public/_headers, so keep both in sync.
 * See docs/security.md for the reasoning behind each header.
 *
 * Can be tested with: https://securityheaders.com/
 */

/** Default: the site may only be framed by itself and by the DatoCMS editor (web previews, plugins). */
export const frameAncestors = 'frame-ancestors \'self\' https://*.admin.datocms.com https://plugins-cdn.datocms.com';

/** The editor guide is embedded by the DatoCMS "Custom Page" plugin, which loads it from any DatoCMS host. */
export const editorGuideFrameAncestors = 'frame-ancestors \'self\' https://*.datocms.com';

/**
 * Deny powerful features the site never uses. Features that embeds request via their
 * iframe `allow` attribute (fullscreen, autoplay, picture-in-picture, ...) stay allowed.
 */
export const permissionsPolicy = 'camera=(), geolocation=(), microphone=(), payment=(), usb=()';

export const securityheaders = defineMiddleware(async (context, next) => {
  const response = await next();
  const isEditorGuide =
    context.url.pathname === '/cms/editor-guide/' ||
    context.url.pathname === '/cms/editor-guide';
  const headers: Record<string, string> = {
    'Content-Security-Policy': isEditorGuide ? editorGuideFrameAncestors : frameAncestors,
    'Permissions-Policy': permissionsPolicy,
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
  };

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
