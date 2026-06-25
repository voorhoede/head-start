class OpenInLlm extends HTMLElement {
  #copyButton: HTMLButtonElement | null = null;
  #dropdownButton: HTMLButtonElement | null = null;
  #popover: HTMLElement | null = null;
  #originalLabel = '';

  connectedCallback() {
    this.#copyButton = this.querySelector<HTMLButtonElement>('[data-copy-button]');
    this.#dropdownButton =
      this.querySelector<HTMLButtonElement>('[popovertarget]');
    this.#originalLabel =
      this.#copyButton?.querySelector('[data-copy-label]')?.textContent ?? '';

    const popoverId = this.#dropdownButton?.getAttribute('popovertarget');
    this.#popover = popoverId
      ? this.querySelector<HTMLElement>(`#${popoverId}`)
      : null;
    this.#popover?.addEventListener('toggle', this.#handleToggle);

    this.#copyButton?.addEventListener('click', this.#handleCopy);
  }

  disconnectedCallback() {
    this.#copyButton?.removeEventListener('click', this.#handleCopy);
    this.#popover?.removeEventListener('toggle', this.#handleToggle);
  }

  #handleToggle = (event: Event) => {
    const isOpen = (event as ToggleEvent).newState === 'open';
    this.#dropdownButton?.setAttribute(
      'aria-expanded',
      isOpen ? 'true' : 'false',
    );
  };

  #handleCopy = async () => {
    if (!this.#copyButton) return;

    try {
      const text = await this.#buildCopyText();
      await navigator.clipboard.writeText(text);
      this.#setLabel(this.#copyButton.dataset.labelCopied ?? '');
    } catch (error) {
      console.error('OpenInLlm: failed to copy page', error);
      this.#setLabel(this.#copyButton.dataset.labelError ?? '');
    }
    setTimeout(() => this.#setLabel(this.#originalLabel), 2000);
  };

  #buildCopyText = async (): Promise<string> => {
    const alternateLink = document.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][type="text/markdown"]',
    );
    if (!alternateLink) throw new Error('No markdown alternate link found');

    const response = await fetch(alternateLink.href);
    if (!response.ok) throw new Error('Failed to fetch markdown');

    return response.text();
  };

  #setLabel(text: string) {
    const label = this.#copyButton?.querySelector('[data-copy-label]');
    if (label) label.textContent = text;
  }
}

customElements.define('open-in-llm', OpenInLlm);
