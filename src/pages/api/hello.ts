import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  return new Response(JSON.stringify({
    hello: new URL(request.url).searchParams.get('to'),
  }));
};
