import { HEAD_START_PREVIEW, HEAD_START_PREVIEW_SECRET, HEAD_START_SHOW_LOCAL_PREVIEW_BAR, PUBLIC_IS_PRODUCTION } from 'astro:env/server';
import { defineMiddleware } from 'astro:middleware';

export const previewCookieName = 'HEAD_START_PREVIEW';

export const hashSecret = async (secret: string) => {
  const msgUint8 = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const preview = defineMiddleware(async ({ cookies, locals }, next) => {
  const previewSecret = HEAD_START_PREVIEW_SECRET!;
  const isPreview = HEAD_START_PREVIEW;
  const isProduction = PUBLIC_IS_PRODUCTION;
  const showPreviewBarLocally = HEAD_START_SHOW_LOCAL_PREVIEW_BAR;
  
  // Show preview bar in production when in preview mode, or in development when explicitly enabled via env var
  const showPreviewBar = isProduction 
    ? isPreview // Production: only show on preview branches
    : showPreviewBarLocally; // Development: only show if HEAD_START_SHOW_LOCAL_PREVIEW_BAR=true
  
  // In local development with preview bar enabled, also enable preview mode (draft fetching)
  // This ensures draft content is fetched when preview bar is shown locally
  const effectiveIsPreview = isProduction 
    ? isPreview // Production: use actual preview branch status
    : showPreviewBar; // Development: enable preview mode when preview bar is shown
  
  // In development mode with preview bar enabled, auto-authenticate if secret is set
  // In production, always require valid cookie
  const cookieValue = cookies.get(previewCookieName)?.value;
  const hasValidCookie = Boolean(previewSecret) && cookieValue === await hashSecret(previewSecret);
  const isPreviewAuthOk = isProduction 
    ? hasValidCookie // In production, require valid cookie
    : showPreviewBar && Boolean(previewSecret); // In dev, auto-auth if preview bar is enabled and secret is set
  
  Object.assign(locals, {
    isPreview: effectiveIsPreview, // Use effective preview mode (includes local preview bar)
    showPreviewBar,
    isPreviewAuthOk,
    previewSecret
  });
  const response = await next();

  if (locals.isPreview) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  return response;
});
