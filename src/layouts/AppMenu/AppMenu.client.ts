import { computePosition } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

class AppMenu extends HTMLElement {
  #menuButton: HTMLButtonElement;
  #dialog: HTMLDialogElement;
  #menuList: HTMLElement;
  #observer: ResizeObserver | undefined;

  constructor() {
    super();
    this.#menuButton = this.querySelector('[data-menu-button]') as HTMLButtonElement;
    this.#dialog = this.querySelector('[data-menu-dialog]') as HTMLDialogElement;
    this.#menuList = this.querySelector('[data-menu-list]') as HTMLElement;
  }

  open() {
    this.#dialog.showModal();
  }

  close() {
    this.#dialog.close();
    this.#menuButton.focus();
  }

  #popover(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const button = target.closest('[popovertarget]') as HTMLElement;
    const popoverId = target.getAttribute('popovertarget');
    const popover = this.querySelector(`#${popoverId}`) as HTMLElement;
    const placement = (popover?.getAttribute('data-placement') ?? 'bottom-start') as Placement;

    if (!button || !popover) return;

    computePosition(button, popover, { placement }).then(({ x, y }) => {
      Object.assign(popover.style, { left: `${x}px`, top: `${y}px` });
    });
  }

  #onResize() {
    this.classList.remove('is-compact');
    const isFitting = this.#menuList.scrollWidth <= this.#menuList.clientWidth;
    this.classList.toggle('is-compact', !isFitting);
  }

  connectedCallback() {
    this.#menuButton.removeAttribute('hidden');
    this.#menuButton.addEventListener('click', this.open.bind(this));
    this.#menuList.addEventListener('click', this.#popover.bind(this));
    this.#dialog.addEventListener('click', this.close.bind(this));
    this.#observer = new ResizeObserver(() => this.#onResize());
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.#menuButton.removeEventListener('click', this.open.bind(this));
    this.#dialog.removeEventListener('click', this.close.bind(this));
    this.#observer?.disconnect();
  }
}

customElements.define('app-menu', AppMenu);
