class EnhancedImage extends HTMLElement {
  imgElement: HTMLImageElement;

  handleImageLoad = (): void => {
    this.imgElement.style.removeProperty('background-image');
    this.imgElement.removeEventListener('load', this.handleImageLoad);
  };

  constructor() {
    super();
    this.imgElement = this.querySelector<HTMLImageElement>('img')!;
  }

  connectedCallback(): void {
    if (this.imgElement.complete) {
      this.handleImageLoad();
    } else {
      this.imgElement.addEventListener('load', this.handleImageLoad);
    }
  }

  disconnectedCallback(): void {
    this.imgElement.removeEventListener('load', this.handleImageLoad);
  }
}

customElements.define('enhanced-image', EnhancedImage);
