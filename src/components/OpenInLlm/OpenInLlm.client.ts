import { computePosition } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

class OpenInLlm extends HTMLElement {
  #copyButton: HTMLButtonElement | null = null;
  #dropdownButton: HTMLButtonElement | null = null;
  #buttonGroup: HTMLElement | null = null;
  #originalLabel = '';

  connectedCallback() {
    this.#copyButton = this.querySelector<HTMLButtonElement>('[data-copy-url]');
    this.#dropdownButton =
      this.querySelector<HTMLButtonElement>('[popovertarget]');
    this.#buttonGroup = this.querySelector<HTMLElement>('[data-button-group]');
    this.#originalLabel =
      this.#copyButton?.querySelector('[data-copy-label]')?.textContent ?? '';

    const popoverId = this.#dropdownButton?.getAttribute('popovertarget');
    const popover = popoverId
      ? this.querySelector<HTMLElement>(`#${popoverId}`)
      : null;
    popover?.addEventListener('toggle', (event) => {
      this.#dropdownButton?.setAttribute(
        'aria-expanded',
        event.newState === 'open' ? 'true' : 'false',
      );
    });

    this.#copyButton?.addEventListener('click', this.#handleCopy);
    this.#dropdownButton?.addEventListener('click', this.#handleDropdown);
  }

  disconnectedCallback() {
    this.#copyButton?.removeEventListener('click', this.#handleCopy);
    this.#dropdownButton?.removeEventListener('click', this.#handleDropdown);
  }

  #handleDropdown = () => {
    const popoverId = this.#dropdownButton?.getAttribute('popovertarget');
    const popover = popoverId
      ? this.querySelector<HTMLElement>(`#${popoverId}`)
      : null;
    if (!popover || !this.#buttonGroup) return;

    const placement = (popover.getAttribute('data-placement') ??
      'bottom-start') as Placement;
    computePosition(this.#buttonGroup, popover, { placement }).then(
      ({ x, y }) => {
        Object.assign(popover.style, {
          left: `${x}px`,
          top: `${y}px`,
          width: `${this.#buttonGroup!.offsetWidth}px`,
        });
      },
    );
  };

  #handleCopy = async () => {
    const url = this.#copyButton?.dataset.copyUrl;
    if (!url) return;

    try {
      const text = await this.#buildCopyText(url);
      await navigator.clipboard.writeText(text);
      this.#setLabel(this.#copyButton?.dataset.labelCopied ?? '');
    } catch {
      this.#setLabel(this.#copyButton?.dataset.labelError ?? '');
    }
    setTimeout(() => this.#setLabel(this.#originalLabel), 2000);
  };

  #buildCopyText = async (pageUrl: string): Promise<string> => {
    const alternateLink = document.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][type="text/markdown"]',
    );
    if (!alternateLink) throw new Error('No markdown alternate link found');

    const response = await fetch(alternateLink.href);
    if (!response.ok) throw new Error('Failed to fetch markdown');

    const markdown = await response.text();
    return `${pageUrl}\n\n${markdown}`;
  };

  #setLabel(text: string) {
    const label = this.#copyButton?.querySelector('[data-copy-label]');
    if (label) label.textContent = text;
  }
}

customElements.define('open-in-llm', OpenInLlm);
