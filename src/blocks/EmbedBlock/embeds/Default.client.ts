class DefaultEmbed extends HTMLElement {
  #provider: string;
  #template?: HTMLTemplateElement;
  #scriptTags: HTMLScriptElement[] = [];

  constructor() {
    super();
    this.#provider = this.dataset.provider || '';
    this.#template = this.querySelector('template') || undefined;
    this.#scriptTags = Array.from(this.querySelectorAll('script[data-src]'));
  }

  connectedCallback() {
    this.#enhance();
  }

  #enhance() {
    if (!this.#template && this.#scriptTags.length === 0) {
      return;
    }
    console.log(`Todo: only enhance after consent for "${this.#provider}". See https://github.com/voorhoede/head-start/issues/49`);
    if (this.#template) {
      const clone = this.#template.content.cloneNode(true);
      this.appendChild(clone);
    }
    if (this.#scriptTags.length === 0) {
      this.setAttribute('data-enhanced', 'true');
      return;
    }
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

customElements.define('default-embed', DefaultEmbed);
