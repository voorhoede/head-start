import { computePosition } from '@floating-ui/dom';
import type { Placement } from '@floating-ui/dom';

class AppMenu extends HTMLElement {
  #menuButton: HTMLButtonElement;
  #dialog: HTMLDialogElement;
  #menuList: HTMLElement;
  #observer: ResizeObserver | undefined;
  #hoverTimeouts: Map<string, number> = new Map();
  #hoverCloseDelayMs = 150;

  #onMenuButtonClick = () => {
    this.open();
  };

  #onDialogClick = () => {
    this.close();
  };

  #onMenuListClick = (event: Event) => {
    const button = (event.target as HTMLElement).closest('[popovertarget]') as HTMLElement;
    if (!button) return;

    const popoverId = button.getAttribute('popovertarget');
    const popover = popoverId ? this.querySelector(`#${popoverId}`) as HTMLElement : null;
    const menuItem = button.closest('[data-menu-item], [data-submenu-item]') as HTMLElement | null;
    const reference = menuItem ?? button;

    if (popover) {
      this.#positionPopover(reference, popover);
    }
  };

  #onMenuItemMouseEnter = (event: Event) => {
    const menuItem = event.currentTarget as HTMLElement;
    const button = menuItem.querySelector('[popovertarget]') as HTMLElement | null;
    const popoverId = button?.getAttribute('popovertarget');
    if (popoverId) {
      const timeout = this.#hoverTimeouts.get(popoverId);
      if (timeout) {
        clearTimeout(timeout);
        this.#hoverTimeouts.delete(popoverId);
      }
    }
    this.#showPopover(menuItem);
  };

  #onMenuItemMouseLeave = (event: Event) => {
    const menuItem = event.currentTarget as HTMLElement;
    const button = menuItem.querySelector('[popovertarget]') as HTMLElement | null;
    const popoverId = button?.getAttribute('popovertarget');
    if (!popoverId) return;

    const relatedTarget = (event as MouseEvent).relatedTarget;
    if (relatedTarget instanceof Node) {
      if (menuItem.contains(relatedTarget)) return;
      const popover = this.querySelector(`#${popoverId}`) as HTMLElement | null;
      if (popover?.contains(relatedTarget)) return;
    }

    const timeout = window.setTimeout(() => {
      this.#hidePopover(menuItem);
    }, this.#hoverCloseDelayMs);
    this.#hoverTimeouts.set(popoverId, timeout);
  };

  #onPopoverMouseEnter = (event: Event) => {
    const popover = event.currentTarget as HTMLElement;
    const timeout = this.#hoverTimeouts.get(popover.id);
    if (timeout) {
      clearTimeout(timeout);
      this.#hoverTimeouts.delete(popover.id);
    }
  };

  #onPopoverMouseLeave = (event: Event) => {
    const popover = event.currentTarget as HTMLElement;
    const menuItem = this.#menuList
      .querySelector(`[popovertarget="${popover.id}"]`)
      ?.closest('[data-menu-item]') as HTMLElement;
    if (!menuItem) return;

    const relatedTarget = (event as MouseEvent).relatedTarget;
    if (relatedTarget instanceof Node) {
      if (menuItem.contains(relatedTarget)) return;
      if (popover.contains(relatedTarget)) return;
    }

    const timeout = window.setTimeout(() => {
      this.#hidePopover(menuItem);
    }, this.#hoverCloseDelayMs);
    this.#hoverTimeouts.set(popover.id, timeout);
  };

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

  #positionPopover(reference: HTMLElement, popover: HTMLElement) {
    const placement = (popover.getAttribute('data-placement') ?? 'bottom-start') as Placement;
    computePosition(reference, popover, { placement }).then(({ x, y }) => {
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

    this.#positionPopover(menuItem, popover);

    try {
      if (!popover.matches(':popover-open')) {
        popover.showPopover();
      }
    } catch (e) {
      console.error(e);
    }
  }

  #hidePopover(menuItem: HTMLElement) {
    const button = menuItem.querySelector('[popovertarget]') as HTMLElement;
    if (!button) return;

    const popoverId = button.getAttribute('popovertarget');
    if (!popoverId) return;

    const popover = this.querySelector(`#${popoverId}`) as HTMLElement;
    if (!popover) return;

    if (popover.matches(':popover-open')) {
      popover.hidePopover();
    }

    this.#hoverTimeouts.delete(popoverId);
  }

  #onResize() {
    this.classList.remove('is-compact');
    const isFitting = this.#menuList.scrollWidth <= this.#menuList.clientWidth;
    this.classList.toggle('is-compact', !isFitting);
  }

  connectedCallback() {
    this.#menuButton.removeAttribute('hidden');
    this.#menuButton.addEventListener('click', this.#onMenuButtonClick);
    this.#dialog.addEventListener('click', this.#onDialogClick);

    // Position popovers on click
    this.#menuList.addEventListener('click', this.#onMenuListClick);

    // Add hover support for menu items
    const menuItems = this.#menuList.querySelectorAll('[data-menu-item]');
    menuItems.forEach((item) => {
      item.addEventListener('mouseenter', this.#onMenuItemMouseEnter);
      item.addEventListener('mouseleave', this.#onMenuItemMouseLeave);
    });

    // Keep popover open when hovering over it
    const popovers = this.querySelectorAll('[popover]');
    popovers.forEach((popover) => {
      popover.addEventListener('mouseenter', this.#onPopoverMouseEnter);
      popover.addEventListener('mouseleave', this.#onPopoverMouseLeave);
    });

    this.#observer = new ResizeObserver(() => this.#onResize());
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.#menuButton.removeEventListener('click', this.#onMenuButtonClick);
    this.#dialog.removeEventListener('click', this.#onDialogClick);
    this.#menuList.removeEventListener('click', this.#onMenuListClick);
    this.#menuList.querySelectorAll('[data-menu-item]').forEach((item) => {
      item.removeEventListener('mouseenter', this.#onMenuItemMouseEnter);
      item.removeEventListener('mouseleave', this.#onMenuItemMouseLeave);
    });
    this.querySelectorAll('[popover]').forEach((popover) => {
      popover.removeEventListener('mouseenter', this.#onPopoverMouseEnter);
      popover.removeEventListener('mouseleave', this.#onPopoverMouseLeave);
    });
    this.#observer?.disconnect();
    this.#hoverTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.#hoverTimeouts.clear();
  }
}

customElements.define('app-menu', AppMenu);
