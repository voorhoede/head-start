/**
 * A custom HTML element that enhances an `<img>` element with additional behavior.
 * Automatically removes the inline `background-image` style once the image is fully loaded.
 */
class ImageComponent extends HTMLElement {
  #element: HTMLImageElement;
  
  constructor() {
    super();
    this.#element = this.querySelector<HTMLImageElement>('img')!;
  }

  #removeBackground(): void {
    this.#element.style.removeProperty('background-image');
    this.#element.removeEventListener('load', this);
  }

  handleEvent(event: Event): void {
    if (event.type === 'load') {
      this.#removeBackground();
    }
  }

  connectedCallback(): void {
    if (this.#element.complete) {
      this.#removeBackground();
    } else {
      this.#element.addEventListener('load', this);
    }
  }

  disconnectedCallback(): void {
    this.#element.removeEventListener('load', this);
  }
}

customElements.define('image-component', ImageComponent);
