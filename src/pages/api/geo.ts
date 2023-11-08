import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ locals, request }) => {
  return new Response(JSON.stringify({
    cf: locals.runtime.cf,
  }, null, 2));
};
