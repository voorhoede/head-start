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
  
  const showPreviewBar = isProduction ? isPreview : showPreviewBarLocally;
  const shouldFetchDrafts = isProduction ? isPreview : showPreviewBar;
  
  const cookieValue = cookies.get(previewCookieName)?.value;
  const hasValidCookie = Boolean(previewSecret) && cookieValue === await hashSecret(previewSecret);
  const isPreviewAuthOk = isProduction 
    ? hasValidCookie
    : showPreviewBar && Boolean(previewSecret);
  
  Object.assign(locals, {
    isPreview: shouldFetchDrafts,
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
