import type { APIRoute } from 'astro';
import { HEAD_START_PREVIEW_SECRET } from 'astro:env/server';
import { recordToWebsiteRoute } from '~/lib/datocms/recordInfo';

export const prerender = false;

const ALLOWED_ORIGIN = /^https:\/\/[a-z0-9-]+\.admin\.datocms\.com$/;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
  if (ALLOWED_ORIGIN.test(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export const OPTIONS: APIRoute = ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};

type PreviewLink = {
  label: string;
  url: string;
  reloadPreviewOnRecordUpdate?: { delayInMs: number };
};

type WebPreviewsPayload = {
  item: { id: string; attributes?: Record<string, unknown>; meta?: { status?: string } };
  itemType: { attributes?: { api_key?: string } };
  locale: string;
};

export const POST: APIRoute = async ({ url, request }) => {
  const token = url.searchParams.get('token');
  if (!token || token !== HEAD_START_PREVIEW_SECRET) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    });
  }

  let body: WebPreviewsPayload;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    });
  }

  const { item, itemType, locale } = body;
  const apiKey = itemType?.attributes?.api_key;
  const recordUrl = apiKey ? recordToWebsiteRoute(item, apiKey, locale ?? 'en') : null;

  const previewLinks: PreviewLink[] = [];

  if (recordUrl) {
    const baseUrl = new URL(request.url).origin;
    const enableUrl = new URL('/api/draft-mode/enable', baseUrl);
    enableUrl.searchParams.set('redirect', recordUrl);
    enableUrl.searchParams.set('token', token);

    const exitUrl = new URL('/api/preview/exit/', baseUrl);
    exitUrl.searchParams.set('location', recordUrl);

    if (item?.meta?.status !== 'published') {
      previewLinks.push({
        label: 'Draft version',
        url: enableUrl.toString(),
        reloadPreviewOnRecordUpdate: { delayInMs: 100 },
      });
    }
    if (item?.meta?.status !== 'draft') {
      previewLinks.push({
        label: 'Published version',
        url: exitUrl.toString(),
      });
    }
  }

  return new Response(JSON.stringify({ previewLinks }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
};
