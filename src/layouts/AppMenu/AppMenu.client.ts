class AppMenu extends HTMLElement {
  #closeButton: HTMLButtonElement;
  #menuButton: HTMLButtonElement;
  #dialog: HTMLDialogElement;
  #menuList: HTMLElement;
  #observer: ResizeObserver | undefined;

  constructor() {
    super();
    this.#closeButton = this.querySelector('[data-menu-close]') as HTMLButtonElement;
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

  #onDialogClick(event: MouseEvent) {
    const rect = this.#dialog.getBoundingClientRect();
    const isClickOutside = 
      event.clientY < rect.top ||
      event.clientY > rect.bottom ||
      event.clientX < rect.left ||
      event.clientX > rect.right;
    if (isClickOutside) {
      this.close();
    }
  }

  #onResize() {
    this.classList.remove('is-compact');
    const isFitting = this.#menuList.scrollWidth <= this.#menuList.clientWidth;
    this.classList.toggle('is-compact', !isFitting);
  }

  connectedCallback() {
    this.#menuButton.removeAttribute('hidden');
    this.#menuButton.addEventListener('click', this.open.bind(this));
    this.#dialog.addEventListener('click', this.#onDialogClick.bind(this));
    this.#closeButton.addEventListener('click', this.close.bind(this));
    this.#observer = new ResizeObserver(() => this.#onResize());
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.#menuButton.removeEventListener('click', this.open.bind(this));
    this.#dialog.removeEventListener('click', this.#onDialogClick.bind(this));
    this.#closeButton.removeEventListener('click', this.close.bind(this));
    this.#observer?.disconnect();
  }
}

customElements.define('app-menu', AppMenu);
