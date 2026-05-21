import type { APIRoute } from 'astro';
import { editModeCookieName } from '~/middleware/preview';
import { cookiePath } from './enter';
import { PUBLIC_IS_PRODUCTION } from 'astro:env/server';

export const prerender = false;

export const GET: APIRoute = ({ cookies, request }) => {
  const editModeOn = cookies.get(editModeCookieName)?.value !== '0';
  cookies.set(editModeCookieName, editModeOn ? '0' : '1', {
    httpOnly: true,
    secure: PUBLIC_IS_PRODUCTION,
    path: cookiePath,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  // Redirect back to the page the toggle was clicked on. Only same-origin
  // targets are allowed so a crafted ?location cannot turn this into an
  // open redirect.
  const requestUrl = new URL(request.url);
  const locationParam = requestUrl.searchParams.get('location');
  let location = '/';
  if (locationParam) {
    const target = new URL(locationParam, requestUrl);
    if (target.origin === requestUrl.origin) {
      location = target.pathname + target.search;
    }
  }

  return new Response('', {
    status: 307,
    headers: { Location: location },
  });
};
