/**
 * A custom HTML element that enhances an `<img>` element with additional behavior.
 * Automatically removes the inline `background-image` style once the image is fully loaded.
 */
class EnhancedImage extends HTMLElement {
  /**
   * The `img` element contained within this custom element.
   */
  imgElement: HTMLImageElement;

  /**
   * Handles the `load` event of the `imgElement`.
   * Removes the `background-image` style from the `imgElement` and unregisters the event listener.
   */
  handleImageLoad = (): void => {
    this.imgElement.style.removeProperty('background-image');
    this.imgElement.removeEventListener('load', this.handleImageLoad);
  };

  /**
   * Constructs the `EnhancedImage` element and initializes the `imgElement` property.
   */
  constructor() {
    super();
    this.imgElement = this.querySelector<HTMLImageElement>('img')!;
  }

  /**
   * Called when the custom element is added to the DOM.
   * Sets up the `load` event listener for the `imgElement` and immediately handles
   * the `load` event if the image is already loaded.
   */
  connectedCallback(): void {
    if (this.imgElement.complete) {
      this.handleImageLoad();
    } else {
      this.imgElement.addEventListener('load', this.handleImageLoad);
    }
  }

  /**
   * Called when the custom element is removed from the DOM.
   * Cleans up the `load` event listener to prevent memory leaks.
   */
  disconnectedCallback(): void {
    this.imgElement.removeEventListener('load', this.handleImageLoad);
  }
}

customElements.define('enhanced-image', EnhancedImage);
