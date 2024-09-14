import { persistentMap } from '@nanostores/persistent';
import type { VideoField } from '@lib/types/datocms';

type ConsentKey = VideoField['provider'];
type ConsentMap = {
  [key: ConsentKey]: boolean;
};
const defaultConsent: ConsentMap = {
  facebook: false,
  youtube: false,
  vimeo: false,
};
const $consent = persistentMap<ConsentMap>(
  'VideoEmbedBlock:consent:',
  defaultConsent,
  {
    decode: JSON.parse,
    encode: JSON.stringify,
  }
);

// Each video embed has its own video url (configured as data attribute),
// so we use a custom element to porgressively enhance each instance:
// @ see https://docs.astro.build/en/guides/client-side-scripts/#web-components-with-custom-elements
class VideoEmbed extends HTMLElement {
  #consentAlert: HTMLElement;
  #consentButton: HTMLButtonElement;
  #anchor: HTMLAnchorElement;
  #autoplay = false;
  #iframe: HTMLIFrameElement;
  #isPlaying = false;
  #provider: ConsentKey;
  #videoUrl: string;

  constructor() {
    super();
    this.#consentAlert = this.querySelector('[role="alert"]') as HTMLElement;
    this.#consentButton = this.querySelector(
      '[role="alert"] button'
    ) as HTMLButtonElement;
    this.#anchor = this.querySelector('a') as HTMLAnchorElement;
    this.#iframe = this.querySelector('iframe') as HTMLIFrameElement;
    this.#autoplay = this.dataset.autoplay === 'true';
    this.#provider = this.dataset.provider as ConsentKey;
    this.#videoUrl = this.dataset.videoUrl as string;
  }

  connectedCallback() {
    if (
      !this.#consentAlert ||
      !this.#consentButton ||
      !this.#anchor ||
      !this.#iframe ||
      !this.#provider ||
      !this.#videoUrl
    ) {
      console.warn(
        'VideoEmbedBlock: missing required elements/attributes',
        this
      );
      return;
    }

    if (!this.#anchor || !this.#iframe || !this.#videoUrl) {
      console.warn(
        'VideoEmbedBlock: missing required elements/attributes',
        this
      );
      return;
    }

    this.#anchor.addEventListener('click', this.#onClick.bind(this));
    this.#consentButton.addEventListener(
      'click',
      this.#consentAndPlay.bind(this)
    );

    const useReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (this.#autoplay && !useReducedMotion && this.#hasConsent()) {
      this.play({ focus: false });
    }
  }

  disconnectedCallback() {
    this.#anchor.removeEventListener('click', this.#onClick.bind(this));
    this.#consentButton.removeEventListener(
      'click',
      this.#consentAndPlay.bind(this)
    );
  }

  #consentAndPlay() {
    $consent.setKey(this.#provider, true);
    this.play({ focus: true });
  }

  #hasConsent() {
    return $consent.get()[this.#provider] === true;
  }

  #onClick(event: MouseEvent) {
    event.preventDefault();
    if (this.#hasConsent()) {
      this.play({ focus: true });
    } else {
      this.#consentAlert.removeAttribute('hidden');
      this.#anchor.setAttribute('hidden', '');
    }
  }

  play({ focus }: { focus: boolean }) {
    if (this.#isPlaying) return;
    this.#iframe.src = this.#videoUrl;
    this.#iframe.removeAttribute('hidden');
    this.#consentAlert.setAttribute('hidden', '');
    this.#anchor.setAttribute('hidden', '');
    this.#isPlaying = true;
    if (focus) {
      this.#iframe.focus();
    }
  }
}

customElements.define('video-embed', VideoEmbed);
