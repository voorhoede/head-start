import { persistentMap } from '@nanostores/persistent';

type ConsentMap = Record<string, boolean>;

const $consent = persistentMap<ConsentMap>(
  'DefaultEmbed:consent:',
  {},
  {
    decode: JSON.parse,
    encode: JSON.stringify,
  }
);

const enhanceIntersectedEmbeds = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.target instanceof DefaultEmbed) {
      entry.target.enhance();
    }
  });
};

const observer = new IntersectionObserver(
  enhanceIntersectedEmbeds,
  { rootMargin: '100px' }
);

class DefaultEmbed extends HTMLElement {
  #isEnhanced = false;
  #provider: string;
  #template?: HTMLTemplateElement;
  #scriptTags: HTMLScriptElement[] = [];
  #consentAlert?: HTMLElement;
  #consentButton?: HTMLButtonElement;
  #placeholder?: HTMLAnchorElement;

  constructor() {
    super();
    this.#provider = this.dataset.provider || '';
    this.#template = this.querySelector('template') || undefined;
    this.#scriptTags = Array.from(this.querySelectorAll('script[data-src]'));
    this.#consentAlert = (this.querySelector('[role="alert"]') as HTMLElement) ?? undefined;
    this.#consentButton = (this.querySelector('[role="alert"] button') as HTMLButtonElement) ?? undefined;
    this.#placeholder = (this.querySelector('.embed-placeholder') as HTMLAnchorElement) ?? undefined;
  }

  connectedCallback() {
    this.#consentButton?.addEventListener('click', this.#grantConsent.bind(this));
    this.#placeholder?.addEventListener('click', this.#onPlaceholderClick.bind(this));
    observer.observe(this);
  }

  disconnectedCallback() {
    this.#consentButton?.removeEventListener('click', this.#grantConsent.bind(this));
    this.#placeholder?.removeEventListener('click', this.#onPlaceholderClick.bind(this));
  }

  #hasConsent() {
    return $consent.get()[this.#provider] === true;
  }

  #grantConsent() {
    $consent.setKey(this.#provider, true);
    this.#consentAlert?.setAttribute('hidden', '');
    this.#load();
  }

  #onPlaceholderClick(event: MouseEvent) {
    if (!this.#consentAlert) return;
    event.preventDefault();
    if (this.#hasConsent()) {
      this.#load();
    } else {
      this.#placeholder?.setAttribute('hidden', '');
      this.#consentAlert.removeAttribute('hidden');
    }
  }

  enhance() {
    observer.unobserve(this);

    if (!this.#template && this.#scriptTags.length === 0) return;
    if (this.#placeholder && !this.#hasConsent()) return;

    if (!this.#hasConsent()) {
      this.#consentAlert?.removeAttribute('hidden');
      return;
    }

    this.#load();
  }

  #load() {
    if (this.#isEnhanced) {
      return;
    }
    this.#isEnhanced = true;

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
