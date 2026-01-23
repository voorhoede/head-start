import { computePosition } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

class AppMenu extends HTMLElement {
  #menuButton: HTMLButtonElement;
  #dialog: HTMLDialogElement;
  #menuList: HTMLElement;
  #observer: ResizeObserver | undefined;
  #hoverTimeouts: Map<string, number> = new Map();

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

  #positionPopover(button: HTMLElement, popover: HTMLElement) {
    const placement = (popover.getAttribute('data-placement') ?? 'bottom-start') as Placement;
    computePosition(button, popover, { placement }).then(({ x, y }) => {
      Object.assign(popover.style, { left: `${x}px`, top: `${y}px` });
    });
  }

  #showPopover(menuItem: HTMLElement) {
    const button = menuItem.querySelector('[popovertarget]') as HTMLElement;
    if (!button) return;

    const popoverId = button.getAttribute('popovertarget');
    if (!popoverId) return;

    const popover = this.querySelector(`#${popoverId}`) as HTMLElement;
    if (!popover) return;

    // Clear any existing hide timeout
    const existingTimeout = this.#hoverTimeouts.get(popoverId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.#hoverTimeouts.delete(popoverId);
    }

    this.#positionPopover(button, popover);

    try {
      if (!popover.matches(':popover-open')) {
        popover.showPopover();
      }
    } catch (e) {
      console.error(e);
    }
  }

  #hidePopover(menuItem: HTMLElement, delay = 150) {
    const button = menuItem.querySelector('[popovertarget]') as HTMLElement;
    if (!button) return;

    const popoverId = button.getAttribute('popovertarget');
    if (!popoverId) return;

    const popover = this.querySelector(`#${popoverId}`) as HTMLElement;
    if (!popover) return;

    const timeout = window.setTimeout(() => {
      try {
        if (popover.matches(':popover-open')) {
          popover.hidePopover();
        }
      } catch (e) {
        console.error(e);
      }
      this.#hoverTimeouts.delete(popoverId);
    }, delay);

    this.#hoverTimeouts.set(popoverId, timeout);
  }

  #onResize() {
    this.classList.remove('is-compact');
    const isFitting = this.#menuList.scrollWidth <= this.#menuList.clientWidth;
    this.classList.toggle('is-compact', !isFitting);
  }

  connectedCallback() {
    this.#menuButton.removeAttribute('hidden');
    this.#menuButton.addEventListener('click', this.open.bind(this));
    this.#dialog.addEventListener('click', this.close.bind(this));

    // Position popovers on click
    this.#menuList.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest('[popovertarget]') as HTMLElement;
      if (!button) return;

      const popoverId = button.getAttribute('popovertarget');
      const popover = popoverId ? this.querySelector(`#${popoverId}`) as HTMLElement : null;

      if (popover) {
        this.#positionPopover(button, popover);
      }
    });

    // Add hover support for menu items
    const menuItems = this.#menuList.querySelectorAll('.main-menu__item');
    menuItems.forEach((item) => {
      item.addEventListener('mouseenter', () => this.#showPopover(item as HTMLElement));
      item.addEventListener('mouseleave', () => this.#hidePopover(item as HTMLElement));
    });

    // Keep popover open when hovering over it
    const popovers = this.querySelectorAll('[popover]');
    popovers.forEach((popover) => {
      popover.addEventListener('mouseenter', () => {
        const timeout = this.#hoverTimeouts.get(popover.id);
        if (timeout) {
          clearTimeout(timeout);
          this.#hoverTimeouts.delete(popover.id);
        }
      });
      popover.addEventListener('mouseleave', () => {
        const menuItem = this.#menuList.querySelector(`[popovertarget="${popover.id}"]`)?.closest('.main-menu__item') as HTMLElement;
        if (menuItem) {
          this.#hidePopover(menuItem);
        }
      });
    });

    this.#observer = new ResizeObserver(() => this.#onResize());
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.#menuButton.removeEventListener('click', this.open.bind(this));
    this.#dialog.removeEventListener('click', this.close.bind(this));
    this.#observer?.disconnect();
    this.#hoverTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.#hoverTimeouts.clear();
  }
}

customElements.define('app-menu', AppMenu);
