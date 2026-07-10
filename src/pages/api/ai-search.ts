import type { APIRoute } from 'astro';
import { chatCompletion, isAiSearchConfigured, jsonError } from '~/lib/ai-search-api';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (!isAiSearchConfigured()) {
    return jsonError('AI Search is not configured on this deployment.', 503);
  }

  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const query = body.query?.trim();
  if (!query) {
    return jsonError('Missing \'query\' field.', 400);
  }

  const wantsJson = url.searchParams.get('format') === 'json';

  return chatCompletion([{ role: 'user', content: query }], wantsJson);
};
