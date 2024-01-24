/**
 * Save Data mode is experimental untyped browser feature, so needs a bit of voodoo:
 * @see https://web.dev/articles/optimizing-content-efficiency-save-data
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
 */
const useDataSaveMode = (() => {
  type NetworkInformation = { saveData: boolean; }
  const connection = (navigator as unknown as { connection: NetworkInformation }).connection;
  return connection.saveData === true; 
})();

class VideoBlock extends HTMLElement {
  #autoplay = false;
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

    const useReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.#autoplay && !useDataSaveMode && !useReducedMotion) {
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
