class TwitterEmbed extends HTMLElement {
  #scriptTags: HTMLScriptElement[] = [];

  constructor() {
    super();
    this.#scriptTags = Array.from(this.querySelectorAll('script[data-src]'));
  }

  connectedCallback() {
    /* todo: only enable scripts after consent. See https://github.com/voorhoede/head-start/issues/49 */
    const allScriptsLoaded = Promise.all(this.#scriptTags.map((script) => {
      return new Promise((resolve) => script.addEventListener('load', resolve));
    }));
    allScriptsLoaded.then(() => {
      this.setAttribute('data-enhanced', 'true');
    });
    this.#scriptTags.forEach((script) => {
      script.src = script.dataset.src as string;
    });
  }
}

customElements.define('twitter-embed', TwitterEmbed);
