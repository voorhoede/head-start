import { marked } from 'marked';
import { readSseEvents, parseChunks, getDeltaContent, type RetrievedChunk } from '~/lib/ai-stream';

/*
 * <ai-search> custom element. Sends the question to /api/ai-search, then shows
 * the answer and its sources as they stream back.
 *
 * The response arrives as a stream: first a `chunks` event listing the source
 * pages, then the answer text in small pieces.
 */

class AiSearch extends HTMLElement {
  #form: HTMLFormElement;
  #input: HTMLInputElement;
  #submit: HTMLButtonElement;
  #result: HTMLElement;
  #status: HTMLElement;
  #answer: HTMLElement;
  #sourcesWrap: HTMLElement;
  #sources: HTMLElement;

  constructor() {
    super();
    this.#form = this.querySelector('form') as HTMLFormElement;
    this.#input = this.querySelector('[data-input]') as HTMLInputElement;
    this.#submit = this.querySelector('[data-submit]') as HTMLButtonElement;
    this.#result = this.querySelector('[data-result]') as HTMLElement;
    this.#status = this.querySelector('[data-status]') as HTMLElement;
    this.#answer = this.querySelector('[data-answer]') as HTMLElement;
    this.#sourcesWrap = this.querySelector('[data-sources-wrap]') as HTMLElement;
    this.#sources = this.querySelector('[data-sources]') as HTMLElement;
  }

  connectedCallback() {
    this.#form.addEventListener('submit', this.#handleSubmit);

    // If the page was opened with ?query= in the URL, run that search straight away.
    const initial = new URL(location.href).searchParams.get('query')?.trim();
    if (initial) {
      this.#input.value = initial;
      void this.#run(initial);
    }
  }

  disconnectedCallback() {
    this.#form.removeEventListener('submit', this.#handleSubmit);
  }

  #handleSubmit = (event: Event) => {
    event.preventDefault();
    const query = this.#input.value.trim();
    if (!query) return;

    const url = new URL(location.href);
    url.searchParams.set('query', query);
    history.replaceState(null, '', url);

    void this.#run(query);
  };

  async #run(query: string) {
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
          for (const source of parseChunks(event.data as RetrievedChunk[], seenUrls)) {
            this.#addSource(source.title, source.url);
          }
        } else {
          const delta = getDeltaContent(event);
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
    this.#submit.disabled = busy;
    this.#input.disabled = busy;
  }
}

customElements.define('ai-search', AiSearch);
