import { describe, expect, test } from 'vitest';
import {
  getDeltaContent,
  parseChunks,
  readSseEvents,
  renderMarkdown,
  type SseEvent,
} from '~/lib/ai-stream';

/*
 * Turn a list of string parts into a ReadableStream, each part delivered as its
 * own chunk. This lets us assert that `readSseEvents` reassembles events that
 * are split across read boundaries.
 */
function streamFrom(parts: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<SseEvent[]> {
  const events: SseEvent[] = [];
  for await (const event of readSseEvents(stream)) events.push(event);
  return events;
}

describe('readSseEvents', () => {
  test('parses a named event with JSON data', async () => {
    const events = await collect(streamFrom(['event: chunks\ndata: {"a":1}\n\n']));
    expect(events).toEqual([{ name: 'chunks', data: { a: 1 } }]);
  });

  test('defaults the event name to "message" when no event line is present', async () => {
    const events = await collect(streamFrom(['data: {"a":1}\n\n']));
    expect(events).toEqual([{ name: 'message', data: { a: 1 } }]);
  });

  test('reassembles an event split across read boundaries', async () => {
    const events = await collect(streamFrom(['event: chu', 'nks\ndata: {"a', '":1}\n\n']));
    expect(events).toEqual([{ name: 'chunks', data: { a: 1 } }]);
  });

  test('emits multiple events delivered in a single chunk', async () => {
    const events = await collect(streamFrom(['data: {"a":1}\n\ndata: {"b":2}\n\n']));
    expect(events).toEqual([
      { name: 'message', data: { a: 1 } },
      { name: 'message', data: { b: 2 } },
    ]);
  });

  test('concatenates multiple data lines within one event', async () => {
    const events = await collect(streamFrom(['data: {"a":\ndata: 1}\n\n']));
    expect(events).toEqual([{ name: 'message', data: { a: 1 } }]);
  });

  test('stops at a [DONE] sentinel and ignores anything after it', async () => {
    const events = await collect(streamFrom(['data: {"a":1}\n\ndata: [DONE]\n\ndata: {"b":2}\n\n']));
    expect(events).toEqual([{ name: 'message', data: { a: 1 } }]);
  });

  test('skips blocks with no data line', async () => {
    const events = await collect(streamFrom([': keep-alive\n\ndata: {"a":1}\n\n']));
    expect(events).toEqual([{ name: 'message', data: { a: 1 } }]);
  });

  test('skips data that is not valid JSON', async () => {
    const events = await collect(streamFrom(['data: not-json\n\ndata: {"a":1}\n\n']));
    expect(events).toEqual([{ name: 'message', data: { a: 1 } }]);
  });

  test('ignores a trailing block without a terminating blank line', async () => {
    const events = await collect(streamFrom(['data: {"a":1}\n\ndata: {"b":2}']));
    expect(events).toEqual([{ name: 'message', data: { a: 1 } }]);
  });
});

describe('parseChunks', () => {
  const chunkFor = (url: string, title?: string) => ({
    text: `---\n${title ? `title: "${title}"\n` : ''}url: "${url}"\n---\n\n`,
  });

  test('extracts url and title from chunk frontmatter', () => {
    const sources = parseChunks([chunkFor('https://example.com/', 'Example')], new Set());
    expect(sources).toEqual([{ url: 'https://example.com/', title: 'Example' }]);
  });

  test('falls back to the url as title when title is missing', () => {
    const sources = parseChunks([chunkFor('https://example.com/')], new Set());
    expect(sources).toEqual([{ url: 'https://example.com/', title: 'https://example.com/' }]);
  });

  test('de-dupes against the seen set and mutates it', () => {
    const seen = new Set<string>();
    const first = parseChunks([chunkFor('https://a.com/', 'A')], seen);
    const second = parseChunks([chunkFor('https://a.com/', 'A')], seen);
    expect(first).toHaveLength(1);
    expect(second).toEqual([]);
    expect(seen.has('https://a.com/')).toBe(true);
  });

  test('skips chunks without a url', () => {
    expect(parseChunks([{ text: '# no frontmatter' }, { text: undefined }], new Set())).toEqual([]);
  });

  test.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
  ])('drops a source whose url has the unsafe scheme %j', (url) => {
    const seen = new Set<string>();
    expect(parseChunks([chunkFor(url, 'Evil')], seen)).toEqual([]);
    expect(seen.has(url)).toBe(false);
  });

  test.each([
    'https://example.com/',
    'http://example.com/',
    'mailto:x@example.com',
    '/relative/path',
  ])('keeps a source with the safe url %j', (url) => {
    expect(parseChunks([chunkFor(url, 'Safe')], new Set())).toEqual([{ url, title: 'Safe' }]);
  });
});

/*
 * `renderMarkdown` output is assigned to `innerHTML`, so model output must not
 * be able to inject executable HTML. These guard the sanitization contract.
 */
describe('renderMarkdown sanitization', () => {
  test('escapes a literal <script> tag instead of emitting it', () => {
    const html = renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  test('escapes a literal img with an onerror handler', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  test('neutralizes a javascript: URL in a markdown link', () => {
    const html = renderMarkdown('[click me](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="#"');
  });

  test('neutralizes a javascript: URL in a markdown image', () => {
    const html = renderMarkdown('![img](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('src="#"');
  });

  test('does not emit a live URL for a scheme obfuscated with a control character', () => {
    // marked declines to parse this as a link at all, so it stays inert text;
    // either way the scheme must never become an href/src attribute value.
    const html = renderMarkdown('[x](java\tscript:alert(1))');
    expect(html).not.toContain('="java');
  });

  test('preserves safe http and relative links', () => {
    expect(renderMarkdown('[a](https://example.com/)')).toContain('href="https://example.com/"');
    expect(renderMarkdown('[b](/about)')).toContain('href="/about"');
    expect(renderMarkdown('[c](mailto:x@example.com)')).toContain('href="mailto:x@example.com"');
  });

  test('renders ordinary markdown formatting', () => {
    expect(renderMarkdown('normal **bold** text')).toContain('<strong>bold</strong>');
  });
});

describe('getDeltaContent', () => {
  test('returns the delta content of the first choice', () => {
    const event: SseEvent = { name: 'message', data: { choices: [{ delta: { content: 'hi' } }] } };
    expect(getDeltaContent(event)).toBe('hi');
  });

  test('returns undefined when there are no choices', () => {
    expect(getDeltaContent({ name: 'message', data: {} })).toBeUndefined();
  });

  test('returns undefined when the delta has no content', () => {
    expect(getDeltaContent({ name: 'message', data: { choices: [{ delta: {} }] } })).toBeUndefined();
  });
});
