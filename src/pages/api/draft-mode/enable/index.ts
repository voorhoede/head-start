import { hashSecret, previewCookieName } from '@middleware/preview';
import type { APIRoute } from 'astro';
import { HEAD_START_PREVIEW_SECRET } from 'astro:env/server';

export const prerender = false;

const cookiePath = '/';

function isRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export const GET: APIRoute = async ({ request }) => {
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

  const cookieValue = await hashSecret(HEAD_START_PREVIEW_SECRET);
  const maxAge = 60 * 60 * 24 * 7;
  const cookieHeader = `${previewCookieName}=${cookieValue}; Path=${cookiePath}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=None; Partitioned`;

  return new Response('', {
    status: 307,
    headers: {
      Location: redirectPath,
      'Set-Cookie': cookieHeader,
    },
  });
};
