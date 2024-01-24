const enhanceIntersectedVideoBlocks = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.target instanceof VideoBlock) {
      entry.target.enhance();
    }
  });
};

const videoBlockObserver = new IntersectionObserver(
  enhanceIntersectedVideoBlocks,
  { rootMargin: '0px', threshold: [.5] }
);

class VideoBlock extends HTMLElement {
  #autoplay = false;
  #useReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /**
   * Save Data mode is experimental untyped browser feature, so needs a bit of voodoo:
   * @see https://web.dev/articles/optimizing-content-efficiency-save-data
   * @see https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
   */
  #useDataSaveMode = (() => {
    type NetworkInformation = { saveData: boolean; }
    const connection = (navigator as unknown as { connection: NetworkInformation }).connection;
    return connection.saveData === true; 
  })();
  #video: HTMLVideoElement;

  constructor() { 
    super();
    this.#autoplay = this.dataset.autoplay === 'true';
    this.#video = this.querySelector('video') as HTMLVideoElement;
  }

  connectedCallback() {
    if (!this.#video) {
      console.warn('VideoBlock: missing required elements/attributes', this);
      return;
    }
    videoBlockObserver.observe(this);
  }

  enhance() {
    videoBlockObserver.unobserve(this);

    if (this.#autoplay && !this.#useDataSaveMode && !this.#useReducedMotion) {
      this.play({ focus: false });
    }
  }

  play({ focus }: { focus: boolean }) {
    this.#video.play();
    if (focus) {
      this.#video.focus();
    }
  }
}

customElements.define('video-block', VideoBlock);
