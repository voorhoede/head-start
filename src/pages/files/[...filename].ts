import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const url = `https://www.datocms-assets.com/${params.filename}`;
  console.log('Redirecting file to', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return response;
  } catch(error) {
    console.error('Failed to fetch, redirecting instead', url, error);
    return new Response('',{
      status: 307,
      headers: { 'Location': url },
    });
  }
};
