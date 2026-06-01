import { parseFrontmatter } from '~/lib/frontmatter';

/*
 * Shared helpers for consuming the SSE stream from `/api/ai-search` and
 * `/api/ai-chat`. Both endpoints return the same shape: a `chunks` event
 * listing the retrieved source pages, then OpenAI-style completion chunks
 * with the answer text.
 */

export type SseEvent = { name: string; data: unknown };
export type RetrievedChunk = { text?: string };
export type CompletionChunk = { choices?: { delta?: { content?: string } }[] };
export type Source = { url: string; title: string };

export async function* readSseEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');

      let name = 'message';
      let data = '';
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) name = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).replace(/^ /, '');
      }
      if (data === '[DONE]') return;
      if (!data) continue;
      try {
        yield { name, data: JSON.parse(data) };
      } catch {
        // Skip anything that isn't valid JSON, like keep-alive pings.
      }
    }
  }
}

/*
 * Pull new sources out of a `chunks` event. Mutates `seen` so callers can
 * de-dupe across the whole conversation, not just one event.
 */
export function parseChunks(chunks: RetrievedChunk[], seen: Set<string>): Source[] {
  const sources: Source[] = [];
  for (const chunk of chunks) {
    const { url, title } = parseFrontmatter(chunk.text ?? '');
    if (url && !seen.has(url)) {
      seen.add(url);
      sources.push({ url, title: title || url });
    }
  }
  return sources;
}

export function getDeltaContent(event: SseEvent): string | undefined {
  return (event.data as CompletionChunk).choices?.[0]?.delta?.content;
}
