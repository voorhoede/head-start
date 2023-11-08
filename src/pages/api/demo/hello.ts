import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Demo endpoint to test dynamic use of query parameters in an API route.
 */
export const GET: APIRoute = ({ request }) => {
  return new Response(JSON.stringify({
    hello: new URL(request.url).searchParams.get('to'),
  }));
};
