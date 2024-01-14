import type { APIRoute } from 'astro';
import { fetchOEmbedData, getOEmbedProvider } from '@lib/oembed';

export const prerender = false;

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const jsonResponse = (data: object, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
};

export const GET: APIRoute = async ({ request }) => {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries()) as { url: string, [key: string]: string };
  const { url } = params;
  if (!url) {
    return jsonResponse({ error: 'Missing \'url\' parameter' }, 400);
  }
  if (!isValidUrl(url)) {
    return jsonResponse({ error: 'Invalid \'url\' parameter' }, 400);
  }
  if (!getOEmbedProvider(url)) {
    return jsonResponse({ error: 'No OEmbed provider available for given \'url\'' }, 404);
  }
  const data = await fetchOEmbedData(url);
  if (!data) {
    return jsonResponse({ error: 'Error fetching OEmbed data' }, 500);
  }
  return jsonResponse({ data });
};
