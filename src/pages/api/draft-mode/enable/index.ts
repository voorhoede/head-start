import type { APIRoute } from 'astro';
import { hashSecret, previewCookieName } from '@middleware/preview';
import { HEAD_START_PREVIEW_SECRET, PUBLIC_IS_PRODUCTION } from 'astro:env/server';

export const prerender = false;

const cookiePath = '/';

function isRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export const GET: APIRoute = async ({ cookies, request }) => {
  if (!HEAD_START_PREVIEW_SECRET) {
    return new Response('Preview not configured', { status: 500 });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const redirectPath = url.searchParams.get('redirect') || '/';

  if (token !== HEAD_START_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  if (!isRelativePath(redirectPath)) {
    return new Response('Redirect must be a relative path', { status: 422 });
  }

  cookies.set(previewCookieName, await hashSecret(HEAD_START_PREVIEW_SECRET), {
    httpOnly: true,
    secure: PUBLIC_IS_PRODUCTION,
    path: cookiePath,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return new Response('', {
    status: 307,
    headers: { Location: redirectPath },
  });
};
