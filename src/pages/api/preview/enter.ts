import type { APIRoute } from 'astro';
import { hashSecret, previewCookieName } from '../../../middleware';
import { PUBLIC_IS_PRODUCTION } from 'astro:env/server';

export const prerender = false;

export const cookiePath = '/';

export const GET: APIRoute = async ({ cookies, locals, request }) => {

  if (!locals.previewSecret) {
    return new Response('Configure HEAD_START_PREVIEW_SECRET to enable preview mode', { status: 500 });
  }

  const userSecret = new URL(request.url).searchParams.get('secret');
  if (userSecret && userSecret === locals.previewSecret) {
    cookies.set(previewCookieName, await hashSecret(locals.previewSecret), {
      httpOnly: true,
      secure: PUBLIC_IS_PRODUCTION,
      path: cookiePath,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  // We don't redirect to location as that might lead to open redirect vulnerabilities
  const location = new URL(request.url).searchParams.get('location') || '/';
  return new Response('',{
    status: 307,
    headers: { 'Location': location },
  });
};
