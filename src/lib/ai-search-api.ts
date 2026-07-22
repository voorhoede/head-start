import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_AI_API_TOKEN,
  CLOUDFLARE_AI_SEARCH_INSTANCE_NAME,
} from 'astro:env/server';

/*
 * Shared server helpers for the `/api/ai-search` and `/api/ai-chat` routes.
 * Both proxy the same Cloudflare AI Search chat/completions endpoint: they
 * build a `messages` array, then either stream the SSE response straight
 * through or (with `?format=json`) reshape the buffered JSON response.
 */

type ChatRole = 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; content: string };

export const jsonError = (message: string, status: number) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const isAiSearchConfigured = () =>
  Boolean(CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_AI_API_TOKEN && CLOUDFLARE_AI_SEARCH_INSTANCE_NAME);

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

export const chatCompletion = async (
  messages: ChatMessage[],
  wantsJson: boolean,
): Promise<Response> => {
  const upstream = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai-search/instances/${CLOUDFLARE_AI_SEARCH_INSTANCE_NAME}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, stream: !wantsJson }),
    },
  );

  if (wantsJson) {
    if (!upstream.ok) {
      return jsonError(`Upstream error (${upstream.status})`, upstream.status);
    }
    let payload: ChatCompletionResponse;
    try {
      payload = (await upstream.json());
    } catch {
      return jsonError('Upstream returned a malformed response.', 502);
    }
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
