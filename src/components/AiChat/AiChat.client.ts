import { marked } from 'marked';
import {
  readSseEvents,
  parseChunks,
  getDeltaContent,
  type RetrievedChunk,
  type Source,
} from '~/lib/ai-stream';

/*
 * <ai-chat> custom element. Multi-turn conversation against /api/ai-chat.
 *
 * State lives in `this.#messages` and is mirrored to localStorage so a refresh
 * keeps the conversation. The DOM is built from the same array, so any state
 * change ends with a #render() (or a targeted DOM update during streaming).
 */

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string; sources?: Source[] };

const STORAGE_PREFIX = 'ai-chat:';

class AiChat extends HTMLElement {
  #locale: string;
  #form: HTMLFormElement;
  #input: HTMLTextAreaElement;
  #submit: HTMLButtonElement;
  #clear: HTMLButtonElement;
  #log: HTMLOListElement;
  #empty: HTMLElement;
  #notice: HTMLElement;
  #messages: Message[] = [];

  constructor() {
    super();
    this.#locale = this.dataset.locale ?? '';
    this.#form = this.querySelector('[data-form]') as HTMLFormElement;
    this.#input = this.querySelector('[data-input]') as HTMLTextAreaElement;
    this.#submit = this.querySelector('[data-submit]') as HTMLButtonElement;
    this.#clear = this.querySelector('[data-clear]') as HTMLButtonElement;
    this.#log = this.querySelector('[data-log]') as HTMLOListElement;
    this.#empty = this.querySelector('[data-empty]') as HTMLElement;
    this.#notice = this.querySelector('[data-notice]') as HTMLElement;
  }

  connectedCallback() {
    this.#messages = this.#loadHistory();
    this.#render();

    this.#form.addEventListener('submit', this.#handleSubmit);
    this.#clear.addEventListener('click', this.#handleClear);
    this.#input.addEventListener('keydown', this.#handleKeydown);
  }

  disconnectedCallback() {
    this.#form.removeEventListener('submit', this.#handleSubmit);
    this.#clear.removeEventListener('click', this.#handleClear);
    this.#input.removeEventListener('keydown', this.#handleKeydown);
  }

  #storageKey() {
    return `${STORAGE_PREFIX}${this.#locale}`;
  }

  #loadHistory(): Message[] {
    try {
      const raw = localStorage.getItem(this.#storageKey());
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Only trust entries that look right. Anything else has been tampered
      // with or comes from an older format, so drop it rather than crash.
      return parsed.filter(
        (m): m is Message =>
          typeof m === 'object' &&
          m !== null &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string',
      );
    } catch {
      return [];
    }
  }

  #saveHistory() {
    try {
      localStorage.setItem(this.#storageKey(), JSON.stringify(this.#messages));
    } catch {
      // Private mode or quota full. Chat keeps working in memory; refresh
      // would lose it, but that's better than blocking the user. Surface a
      // one-time notice so the loss isn't silent.
      this.#notice.hidden = false;
    }
  }

  #render() {
    this.#log.replaceChildren();
    for (const message of this.#messages) {
      this.#log.append(this.#renderMessage(message));
    }
    const hasMessages = this.#messages.length > 0;
    this.#empty.hidden = hasMessages;
    this.#clear.hidden = !hasMessages;
    this.#scrollToBottom();
  }

  #renderMessage(message: Message): HTMLLIElement {
    const item = document.createElement('li');
    item.className = `ai-chat__message ai-chat__message--${message.role}`;
    item.setAttribute('data-role', message.role);

    const body = document.createElement('div');
    body.className = 'ai-chat__body';
    if (message.role === 'assistant') {
      body.innerHTML = marked.parse(message.content) as string;
    } else {
      body.textContent = message.content;
    }
    item.append(body);

    if (message.sources && message.sources.length > 0) {
      item.append(this.#renderSources(message.sources));
    }

    return item;
  }

  #renderSources(sources: Source[]): HTMLUListElement {
    const list = document.createElement('ul');
    list.className = 'ai-chat__sources';
    for (const source of sources) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.title;
      li.append(link);
      list.append(li);
    }
    return list;
  }

  #scrollToBottom() {
    this.#log.scrollTop = this.#log.scrollHeight;
  }

  #handleSubmit = (event: Event) => {
    event.preventDefault();
    const content = this.#input.value.trim();
    if (!content) return;
    void this.#run(content);
  };

  #handleKeydown = (event: KeyboardEvent) => {
    // Enter sends; Shift+Enter inserts a newline. Matches most chat UIs.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.#form.requestSubmit();
    }
  };

  #handleClear = () => {
    this.#messages = [];
    this.#saveHistory();
    this.#render();
    this.#input.focus();
  };

  async #run(userContent: string) {
    this.#messages.push({ role: 'user', content: userContent });
    this.#log.append(this.#renderMessage(this.#messages[this.#messages.length - 1]));
    this.#input.value = '';
    this.#empty.hidden = true;
    this.#clear.hidden = false;
    this.#saveHistory();

    const placeholderIndex = this.#messages.length;
    this.#messages.push({ role: 'assistant', content: '' });
    const placeholderEl = this.#renderMessage(this.#messages[placeholderIndex]);
    const placeholderBody = placeholderEl.querySelector('.ai-chat__body') as HTMLElement;
    placeholderBody.textContent = this.dataset.thinkingText ?? '';
    this.#log.append(placeholderEl);
    this.#scrollToBottom();

    this.#setBusy(true);

    let answer = '';
    const seenUrls = new Set<string>();
    const sources: Source[] = [];

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this.#messages
            .slice(0, placeholderIndex)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!response.ok || !response.body) {
        throw new Error(`Request failed (${response.status})`);
      }

      let receivedFirst = false;
      for await (const event of readSseEvents(response.body)) {
        if (event.name === 'chunks') {
          const newSources = parseChunks(event.data as RetrievedChunk[], seenUrls);
          if (newSources.length > 0) {
            sources.push(...newSources);
            // Drop any old sources block, append the latest set.
            placeholderEl.querySelector('.ai-chat__sources')?.remove();
            placeholderEl.append(this.#renderSources(sources));
          }
        } else {
          const delta = getDeltaContent(event);
          if (delta) {
            if (!receivedFirst) {
              placeholderBody.textContent = '';
              receivedFirst = true;
            }
            answer += delta;
            placeholderBody.innerHTML = marked.parse(answer) as string;
            this.#scrollToBottom();
          }
        }
      }

      if (!answer) {
        placeholderBody.textContent = this.dataset.emptyText ?? '';
      }

      this.#messages[placeholderIndex] = { role: 'assistant', content: answer, sources };
    } catch (error) {
      console.error('ai-chat:', error);
      placeholderBody.textContent = this.dataset.errorText ?? '';
      // Drop the failed assistant turn from state so subsequent requests don't
      // include an empty/garbage entry. The error bubble stays visible until
      // the next interaction; on refresh it's gone with the rest of the
      // unsaved state.
      this.#messages.pop();
    } finally {
      this.#saveHistory();
      this.#setBusy(false);
      this.#input.focus();
    }
  }

  #setBusy(busy: boolean) {
    this.toggleAttribute('aria-busy', busy);
    this.#submit.disabled = busy;
    this.#input.disabled = busy;
  }
}

customElements.define('ai-chat', AiChat);
