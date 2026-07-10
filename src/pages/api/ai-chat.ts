import type { APIRoute } from 'astro';
import { chatCompletion, isAiSearchConfigured, jsonError, type ChatMessage } from '~/lib/ai-search-api';
import { HISTORY_CAP } from '~/lib/ai-stream';

export const prerender = false;

const isValidMessage = (message: unknown): message is ChatMessage => {
  if (typeof message !== 'object' || message === null) return false;
  const { role, content } = message as { role?: unknown; content?: unknown };
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
  if (!isAiSearchConfigured()) {
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

  return chatCompletion(messages, wantsJson);
};
