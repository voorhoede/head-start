import type { APIRoute } from 'astro';
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_AI_SEARCH_INSTANCE_NAME,
} from 'astro:env/server';

export const prerender = false;

const jsonError = (message: string, status: number) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

type ChunkMeta = { url?: string; title?: string };
type ChatCompletionResponse = {
  choices?: { message?: { content?: string } }[];
  // Non-streaming response keeps metadata under `item.metadata`; streaming SSE uses `item.attributes`.
  chunks?: { item?: { metadata?: ChunkMeta; attributes?: ChunkMeta } }[];
};

const reshapeAsJson = (payload: ChatCompletionResponse) => {
  const answer = payload.choices?.[0]?.message?.content ?? '';
  const seen = new Set<string>();
  const sources = (payload.chunks ?? []).flatMap((chunk) => {
    const meta = chunk.item?.metadata ?? chunk.item?.attributes;
    const url = meta?.url;
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ url, title: meta?.title ?? url }];
  });
  return { answer, sources };
};

export const POST: APIRoute = async ({ request, url }) => {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_AI_SEARCH_INSTANCE_NAME) {
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

  const upstream = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai-search/instances/${CLOUDFLARE_AI_SEARCH_INSTANCE_NAME}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: query }],
        stream: !wantsJson,
      }),
    },
  );

  if (wantsJson) {
    if (!upstream.ok) {
      return jsonError(`Upstream error (${upstream.status})`, upstream.status);
    }
    const payload = (await upstream.json()) as ChatCompletionResponse;
    return new Response(JSON.stringify(reshapeAsJson(payload), null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'text/event-stream',
      'Cache-Control': 'no-store',
    },
  });
};
