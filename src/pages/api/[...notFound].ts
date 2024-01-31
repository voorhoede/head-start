import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Return a 404 JSON repsonse for any API routes that don't match a file in src/pages/api
 * Instead of having Astro or Cloudflare return a 404 HTML page.
 */
export const GET: APIRoute = () => {
  return new Response(JSON.stringify({
    error: 'Not found',
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
