import type { APIRoute } from 'astro';
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_AI_SEARCH_INSTANCE_NAME,
} from 'astro:env/server';
import { HISTORY_CAP } from '~/lib/ai-stream';

export const prerender = false;

type ChatRole = 'user' | 'assistant';
type ChatMessage = { role: ChatRole; content: string };

const jsonError = (message: string, status: number) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
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

const isValidMessage = (m: unknown): m is ChatMessage => {
  if (typeof m !== 'object' || m === null) return false;
  const { role, content } = m as { role?: unknown; content?: unknown };
  if (role !== 'user' && role !== 'assistant') return false;
  return typeof content === 'string' && content.trim().length > 0;
};

// Cloudflare expects the first message to be from the user. If we trimmed off a
// user turn and the slice now starts with assistant, drop messages until it
// does. Otherwise the upstream call errors.
const capHistory = (messages: ChatMessage[]) => {
  let trimmed = messages.slice(-HISTORY_CAP);
  while (trimmed.length > 0 && trimmed[0].role !== 'user') {
    trimmed = trimmed.slice(1);
  }
  return trimmed;
};

export const POST: APIRoute = async ({ request, url }) => {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_AI_SEARCH_INSTANCE_NAME) {
    return jsonError('AI Search is not configured on this deployment.', 503);
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonError('Missing \'messages\' array.', 400);
  }
  if (!body.messages.every(isValidMessage)) {
    return jsonError('Each message needs role (\'user\' or \'assistant\') and non-empty content.', 400);
  }

  const messages = capHistory(body.messages as ChatMessage[]);
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return jsonError('Last message must be from \'user\'.', 400);
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
      body: JSON.stringify({ messages, stream: !wantsJson }),
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
