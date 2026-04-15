import { computePosition } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

class OpenInLlm extends HTMLElement {
  #copyButton: HTMLButtonElement | null = null;
  #dropdownButton: HTMLButtonElement | null = null;
  #buttonGroup: HTMLElement | null = null;
  #originalLabel = 'Copy page';

  connectedCallback() {
    this.#copyButton = this.querySelector<HTMLButtonElement>('[data-copy-url]');
    this.#dropdownButton =
      this.querySelector<HTMLButtonElement>('[popovertarget]');
    this.#buttonGroup = this.querySelector<HTMLElement>('[data-button-group]');

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

    const text = await this.#buildCopyText(url);

    try {
      await navigator.clipboard.writeText(text);
      this.#setLabel('Copied!'); // TODO TRANSLATION
    } catch {
      this.#setLabel('Could not copy'); // TODO TRANSLATION
    }
    setTimeout(() => this.#setLabel(this.#originalLabel), 2000);
  };

  #buildCopyText = async (pageUrl: string): Promise<string> => {
    // const mdUrl = `${pageUrl.replace(/\/$/, '')}.md`; // TODO markdown version of this page
    const mdUrl =
      'https://nextjs.org/docs/app/getting-started/fetching-data.md'; // --- testing url ---

    try {
      const response = await fetch(mdUrl);
      if (response.ok) {
        const markdown = await response.text();
        // TODO pageUrl should be mdUrl, with extra text?
        return `${pageUrl}\n\n${markdown}`;
      }
    } catch {
      // markdown alternative not available, fall back to page URL
    }
    return pageUrl;
  };

  #setLabel(text: string) {
    const label = this.#copyButton?.querySelector('[data-copy-label]');
    if (label) label.textContent = text;
  }
}

customElements.define('open-in-llm', OpenInLlm);
