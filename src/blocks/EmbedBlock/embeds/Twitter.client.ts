class TwitterEmbed extends HTMLElement {
  #scriptTags: HTMLScriptElement[] = [];

  constructor() {
    super();
    this.#scriptTags = Array.from(this.querySelectorAll('script[data-src]'));
  }

  connectedCallback() {
    /* todo: only enable scripts after consent. See https://github.com/voorhoede/head-start/issues/49 */
    this.setAttribute('data-enhanced', 'true');
    this.#scriptTags.forEach((script) => {
      script.src = script.dataset.src as string;
    });
  }
}

customElements.define('twitter-embed', TwitterEmbed);
