import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  // @todo: remove cookie

  // We don't redirect to location as that might lead to open redirect vulnerabilities
  const location = new URL(request.url).searchParams.get('location') || '/';
  return new Response('',{
    status: 307,
    headers: { 'Location': location },
  });
};
