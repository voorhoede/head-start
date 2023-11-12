import type { APIRoute } from 'astro';
import { previewCookieName } from '../../../middleware';

const previewSecret = import.meta.env.HEAD_START_PREVIEW_SECRET;

export const cookiePath = '/';

export const GET: APIRoute = ({ cookies, request }) => {

  if (!previewSecret) {
    return new Response('Configure HEAD_START_PREVIEW_SECRET to enable preview mode', { status: 500 });
  }

  const userSecret = new URL(request.url).searchParams.get('secret');
  if (userSecret && userSecret === previewSecret) {
    cookies.set(previewCookieName, previewSecret, {
      httpOnly: true,
      secure: import.meta.env.PROD,
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
