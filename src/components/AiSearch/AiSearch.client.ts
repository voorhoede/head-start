interface SourceChunk {
  id?: string;
  item?: {
    key?: string;
    attributes?: { url?: string; title?: string };
  };
}

class AiSearch extends HTMLElement {
  #form: HTMLFormElement | null = null;
  #input: HTMLInputElement | null = null;
  #submit: HTMLButtonElement | null = null;
  #response: HTMLElement | null = null;
  #sourcesSection: HTMLElement | null = null;
  #sources: HTMLUListElement | null = null;
  #endpoint = '/api/ai-search';

  connectedCallback() {
    this.#form = this.querySelector<HTMLFormElement>('[data-form]');
    this.#input = this.querySelector<HTMLInputElement>('[data-input]');
    this.#submit = this.querySelector<HTMLButtonElement>('[data-submit]');
    this.#response = this.querySelector<HTMLElement>('[data-response]');
    this.#sourcesSection = this.querySelector<HTMLElement>('[data-sources-section]');
    this.#sources = this.querySelector<HTMLUListElement>('[data-sources]');
    this.#endpoint = this.dataset.endpoint ?? this.#endpoint;
    this.#form?.addEventListener('submit', this.#handleSubmit);
  }

  disconnectedCallback() {
    this.#form?.removeEventListener('submit', this.#handleSubmit);
  }

  #handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const query = this.#input?.value.trim();
    if (!query || !this.#response || !this.#sources || !this.#sourcesSection) return;

    this.#response.textContent = '';
    this.#sources.replaceChildren();
    this.#sourcesSection.hidden = true;
    if (this.#submit) this.#submit.disabled = true;

    try {
      const res = await fetch(this.#endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok || !res.body) {
        this.#response.textContent = `Error ${res.status}`;
        return;
      }
      await this.#readStream(res.body);
    } catch (error) {
      this.#response.textContent = `Request failed: ${(error as Error).message}`;
    } finally {
      if (this.#submit) this.#submit.disabled = false;
    }
  };

  async #readStream(body: ReadableStream<Uint8Array>) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const seenSources = new Set<string>();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';
      for (const raw of events) this.#handleEvent(raw, seenSources);
    }
  }

  #handleEvent(raw: string, seenSources: Set<string>) {
    const lines = raw.split('\n');
    let eventName = 'message';
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('event:')) eventName = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length === 0) return;
    const data = dataLines.join('\n');
    if (data === '[DONE]') return;

    let payload: unknown;
    try {
      payload = JSON.parse(data);
    } catch {
      this.#response?.append(data);
      return;
    }

    if (eventName === 'chunks' || Array.isArray((payload as { chunks?: unknown }).chunks)) {
      const list = (payload as { chunks?: SourceChunk[] }).chunks ?? (payload as SourceChunk[]);
      if (Array.isArray(list)) this.#renderSources(list, seenSources);
      return;
    }

    const text = this.#extractText(payload);
    if (text) this.#response?.append(text);
  }

  #extractText(payload: unknown): string {
    if (typeof payload === 'string') return payload;
    const p = payload as {
      choices?: { delta?: { content?: string }; message?: { content?: string } }[];
      response?: string;
    };
    return (
      p.choices?.[0]?.delta?.content ??
      p.choices?.[0]?.message?.content ??
      p.response ??
      ''
    );
  }

  #renderSources(chunks: SourceChunk[], seen: Set<string>) {
    if (!this.#sources || !this.#sourcesSection) return;
    for (const chunk of chunks) {
      const url = chunk.item?.attributes?.url;
      const title = chunk.item?.attributes?.title || chunk.item?.key || url;
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url;
      a.textContent = title ?? url;
      li.append(a);
      this.#sources.append(li);
    }
    if (seen.size > 0) this.#sourcesSection.hidden = false;
  }
}

customElements.define('ai-search', AiSearch);
