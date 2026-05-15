import { autoUpdate, computePosition, flip, shift } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

class OpenInLlm extends HTMLElement {
  #copyButton: HTMLButtonElement | null = null;
  #dropdownButton: HTMLButtonElement | null = null;
  #buttonGroup: HTMLElement | null = null;
  #popover: HTMLElement | null = null;
  #originalLabel = '';
  #stopAutoUpdate: (() => void) | null = null;

  connectedCallback() {
    this.#copyButton = this.querySelector<HTMLButtonElement>('[data-copy-url]');
    this.#dropdownButton =
      this.querySelector<HTMLButtonElement>('[popovertarget]');
    this.#buttonGroup = this.querySelector<HTMLElement>('[data-button-group]');
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
    this.#stopAutoUpdate?.();
    this.#stopAutoUpdate = null;
  }

  #handleToggle = (event: Event) => {
    const isOpen = (event as ToggleEvent).newState === 'open';
    this.#dropdownButton?.setAttribute(
      'aria-expanded',
      isOpen ? 'true' : 'false',
    );

    this.#stopAutoUpdate?.();
    this.#stopAutoUpdate = null;

    if (!isOpen || !this.#popover || !this.#buttonGroup) return;

    const placement = (this.#popover.getAttribute('data-placement') ??
      'bottom-start') as Placement;
    const initialScrollY = window.scrollY;
    const initialScrollX = window.scrollX;
    this.#popover.style.visibility = 'hidden';
    this.#stopAutoUpdate = autoUpdate(
      this.#buttonGroup,
      this.#popover,
      () => {
        if (!this.#popover || !this.#buttonGroup) return;
        if (
          window.scrollY !== initialScrollY ||
          window.scrollX !== initialScrollX
        ) {
          this.#popover.hidePopover();
          return;
        }
        computePosition(this.#buttonGroup, this.#popover, {
          strategy: 'fixed',
          placement,
          middleware: [flip(), shift({ padding: 8 })],
        }).then(({ x, y }) => {
          if (!this.#popover) return;
          Object.assign(this.#popover.style, {
            left: `${x}px`,
            top: `${y}px`,
            visibility: 'visible',
          });
        });
      },
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
