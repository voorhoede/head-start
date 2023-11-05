import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  return new Response(JSON.stringify({
    country: request.cf?.country,
    cf: request.cf,
  }));
};
