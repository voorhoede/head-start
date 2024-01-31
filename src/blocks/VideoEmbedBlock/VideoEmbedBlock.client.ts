// Each video embed has its own video url (configured as data attribute),
// so we use a custom element to porgressively enhance each instance:
// @ see https://docs.astro.build/en/guides/client-side-scripts/#web-components-with-custom-elements
class VideoEmbed extends HTMLElement {
  #anchor: HTMLAnchorElement;
  #autoplay = false;
  #iframe: HTMLIFrameElement;
  #isPlaying = false;
  #videoUrl: string;

  constructor() {
    super();
    this.#anchor = this.querySelector('a') as HTMLAnchorElement;
    this.#iframe = this.querySelector('iframe') as HTMLIFrameElement;
    this.#autoplay = this.dataset.autoplay === 'true';
    this.#videoUrl = this.dataset.videoUrl as string;
  }

  connectedCallback() {
    if (!this.#anchor || !this.#iframe || !this.#videoUrl) {
      console.warn('VideoEmbedBlock: missing required elements/attributes', this);
      return;
    }

    this.#anchor.addEventListener('click', this.#onClick.bind(this));

    const useReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.#autoplay && !useReducedMotion) {
      this.play({ focus: false });
    }
  }

  disconnectedCallback() {
    this.#anchor.removeEventListener('click', this.#onClick.bind(this));
  }

  #onClick(event: MouseEvent) {
    event.preventDefault();
    this.play({ focus: true });
  }

  play({ focus }: { focus: boolean }) {
    if (this.#isPlaying) return;
    this.#iframe.src = this.#videoUrl;
    this.#iframe.removeAttribute('hidden');
    this.#anchor.setAttribute('hidden', '');
    this.#isPlaying = true;
    if (focus) {
      this.#iframe.focus();
    }
  }
}

customElements.define('video-embed', VideoEmbed);
