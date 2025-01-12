import { defineMiddleware } from 'astro:middleware';
import { HEAD_START_PREVIEW_SECRET, HEAD_START_PREVIEW } from 'astro:env/server';

export const previewCookieName = 'HEAD_START_PREVIEW';

export const hashSecret = async (secret: string) => {
  const msgUint8 = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const preview = defineMiddleware(async ({ cookies, locals }, next) => {
  const previewSecret = HEAD_START_PREVIEW_SECRET!;
  Object.assign(locals, {
    isPreview: HEAD_START_PREVIEW,
    isPreviewAuthOk: Boolean(previewSecret) && cookies.get(previewCookieName)?.value === await hashSecret(previewSecret),
    previewSecret
  });
  const response = await next();

  if (locals.isPreview) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  return response;
});
