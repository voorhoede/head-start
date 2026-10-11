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
      await this.#copyToClipboard();
      this.#setLabel(this.#copyButton.dataset.labelCopied ?? '');
    } catch (error) {
      console.error('OpenInLlm: failed to copy page', error);
      this.#setLabel(this.#copyButton.dataset.labelError ?? '');
    }
    setTimeout(() => this.#setLabel(this.#originalLabel), 2000);
  };

  /**
   * The page's markdown has to be fetched before it can be copied. Safari only allows a
   * clipboard write while the click that asked for it is still "active", and an awaited
   * fetch ends that, so `writeText(await text)` fails there with "NotAllowedError".
   * Handing the pending text to a `ClipboardItem` starts the write within the click; the
   * browser waits for the text itself. Browsers that don't accept a promise there get the
   * plain `writeText` after the fetch.
   */
  #copyToClipboard = async () => {
    const text = this.#buildCopyText();
    if (typeof ClipboardItem !== 'undefined' && 'write' in navigator.clipboard) {
      try {
        const item = new ClipboardItem({
          'text/plain': text.then((markdown) => new Blob([markdown], { type: 'text/plain' })),
        });
        await navigator.clipboard.write([item]);
        return;
      } catch (error) {
        console.warn('OpenInLlm: clipboard write with pending text failed, retrying with writeText', error);
      }
    }
    await navigator.clipboard.writeText(await text);
  };

  #buildCopyText = async (): Promise<string> => {
    const alternateLink = document.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][type="text/markdown"]',
    );
    if (!alternateLink) throw new Error('No markdown alternate link found');

    // The alternate link is the canonical (production) URL; fetch the same path from
    // the current origin so this also works locally and on a preview deployment (no CORS).
    const markdownUrl = new URL(new URL(alternateLink.href).pathname, location.origin);
    const response = await fetch(markdownUrl);
    if (!response.ok) throw new Error(`Failed to fetch markdown (${response.status})`);

    return response.text();
  };

  #setLabel(text: string) {
    const label = this.#copyButton?.querySelector('[data-copy-label]');
    if (label) label.textContent = text;
  }
}

customElements.define('open-in-llm', OpenInLlm);
