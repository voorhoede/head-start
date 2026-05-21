import { marked } from 'marked';
import { parseFrontmatter } from '~/lib/frontmatter';

/*
 * <ai-search> custom element. Sends the question to /api/ai-search, then shows
 * the answer and its sources as they stream back.
 *
 * The response arrives as a stream: first a `chunks` event listing the source
 * pages, then the answer text in small pieces.
 */

type SseEvent = { name: string; data: unknown };
type RetrievedChunk = { text?: string };
type CompletionChunk = { choices?: { delta?: { content?: string } }[] };

async function* readSseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
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

class AiSearch extends HTMLElement {
  #form: HTMLFormElement | null = null;
  #input: HTMLInputElement | null = null;
  #submit: HTMLButtonElement | null = null;
  #result: HTMLElement | null = null;
  #status: HTMLElement | null = null;
  #answer: HTMLElement | null = null;
  #sourcesWrap: HTMLElement | null = null;
  #sources: HTMLElement | null = null;

  connectedCallback() {
    this.#form = this.querySelector('form');
    this.#input = this.querySelector('[data-input]');
    this.#submit = this.querySelector('[data-submit]');
    this.#result = this.querySelector('[data-result]');
    this.#status = this.querySelector('[data-status]');
    this.#answer = this.querySelector('[data-answer]');
    this.#sourcesWrap = this.querySelector('[data-sources-wrap]');
    this.#sources = this.querySelector('[data-sources]');

    this.#form?.addEventListener('submit', this.#handleSubmit);

    // If the page was opened with ?query= in the URL, run that search straight away.
    const initial = new URL(location.href).searchParams.get('query')?.trim();
    if (initial && this.#input) {
      this.#input.value = initial;
      void this.#run(initial);
    }
  }

  disconnectedCallback() {
    this.#form?.removeEventListener('submit', this.#handleSubmit);
  }

  #handleSubmit = (event: Event) => {
    event.preventDefault();
    const query = this.#input?.value.trim();
    if (!query) return;

    const url = new URL(location.href);
    url.searchParams.set('query', query);
    history.replaceState(null, '', url);

    void this.#run(query);
  };

  async #run(query: string) {
    if (!this.#result || !this.#status || !this.#answer || !this.#sources || !this.#sourcesWrap) {
      return;
    }
    this.#result.hidden = false;
    this.#setBusy(true);
    this.#status.textContent = this.dataset.thinkingText ?? '';
    this.#answer.textContent = '';
    this.#sources.replaceChildren();
    this.#sourcesWrap.hidden = true;

    let answer = '';
    const seenUrls = new Set<string>();

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok || !response.body) {
        throw new Error(`Request failed (${response.status})`);
      }

      for await (const event of readSseEvents(response.body)) {
        if (event.name === 'chunks') {
          for (const chunk of event.data as RetrievedChunk[]) {
            const { url, title } = parseFrontmatter(chunk.text ?? '');
            if (url && !seenUrls.has(url)) {
              seenUrls.add(url);
              this.#addSource(title || url, url);
            }
          }
        } else {
          const delta = (event.data as CompletionChunk).choices?.[0]?.delta?.content;
          if (delta) {
            answer += delta;
            // Re-render the whole answer each time, so markdown like code
            // blocks and lists still formats correctly as more text arrives.
            this.#answer.innerHTML = marked.parse(answer) as string;
            this.#status.textContent = '';
          }
        }
      }

      if (!answer) this.#status.textContent = this.dataset.emptyText ?? '';
    } catch (error) {
      console.error('ai-search:', error);
      this.#status.textContent = this.dataset.errorText ?? '';
    } finally {
      this.#setBusy(false);
    }
  }

  #addSource(title: string, url: string) {
    if (!this.#sources || !this.#sourcesWrap) return;
    const link = document.createElement('a');
    link.href = url;
    const name = document.createElement('strong');
    name.textContent = title;
    const location = document.createElement('span');
    location.textContent = url;
    link.append(name, location);
    const item = document.createElement('li');
    item.append(link);
    this.#sources.append(item);
    this.#sourcesWrap.hidden = false;
  }

  #setBusy(busy: boolean) {
    this.toggleAttribute('aria-busy', busy);
    if (this.#submit) this.#submit.disabled = busy;
    if (this.#input) this.#input.disabled = busy;
  }
}

customElements.define('ai-search', AiSearch);
