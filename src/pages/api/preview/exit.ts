import type { APIRoute } from 'astro';
import { previewCookieName } from '../../../middleware';
import { cookiePath } from './enter';

export const prerender = false;

export const GET: APIRoute = ({ cookies, request }) => {

  cookies.delete(previewCookieName, {
    path: cookiePath,
  });

  // We don't redirect to location as that might lead to open redirect vulnerabilities
  const location = new URL(request.url).searchParams.get('location') || '/';
  return new Response('',{
    status: 307,
    headers: { 'Location': location },
  });
};
