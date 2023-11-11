import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  const secret = new URL(request.url).searchParams.get('secret');
  if (!secret) {
    return new Response('Missing query parameter \'secret\'', { status: 401 });
  }

  // @todo: check secret, set cookie

  // We don't redirect to location as that might lead to open redirect vulnerabilities
  const location = new URL(request.url).searchParams.get('location') || '/';
  return new Response('',{
    status: 307,
    headers: { 'Location': location },
  });
};
