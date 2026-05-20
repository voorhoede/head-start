import { getLocale } from '~/lib/i18n';

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

const getHlsPlayer = () => import('hls.js');

class VideoBlock extends HTMLElement {
  #autoplay = false;
  #mp4Url?: string;
  #streamingUrl?: string;
  #useReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /**
   * Save Data mode is experimental untyped browser feature, so needs a bit of voodoo:
   * @see https://web.dev/articles/optimizing-content-efficiency-save-data
   * @see https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
   */
  #useDataSaveMode = (() => {
    if (!('connection' in navigator)) {
      return false;
    }
    
    type NetworkInformation = { saveData: boolean; };
    const connection = (navigator as unknown as { connection: NetworkInformation }).connection;
    return connection.saveData === true;
  })();
  #video: HTMLVideoElement;

  constructor() {
    super();
    this.#autoplay = (this.dataset.autoplay === 'true') && !this.#useDataSaveMode && !this.#useReducedMotion;
    this.#mp4Url = this.dataset.mp4Url;
    this.#streamingUrl = this.dataset.streamingUrl;
    this.#video = this.querySelector('video[data-video]') as HTMLVideoElement;
  }

  connectedCallback() {
    if (!this.#video || !this.#mp4Url || !this.#streamingUrl) {
      console.warn('VideoBlock: missing required elements/attributes', this);
      return;
    }
    if (!this.#autoplay) {
      this.addEventListener('click', this.#onClick.bind(this), { once: true });
    }
    videoBlockObserver.observe(this);
    this.#initChapters();
  }

  disconnectedCallback() {
    if (!this.#autoplay) {
      this.removeEventListener('click', this.#onClick.bind(this));
    }
  }

  #onClick() {
    this.play({ focus: true });
  }

  #initChapters() {
    const chaptersTrack = [...this.#video.textTracks].find(t => t.kind === 'chapters');
    if (!chaptersTrack) return;

    const render = () => {
      chaptersTrack.mode = 'hidden';
      [...(chaptersTrack.cues ?? [])].forEach(cue => {
        const btn = document.createElement('button');
        btn.textContent = (cue as VTTCue).text;
        btn.addEventListener('click', () => { this.#video.currentTime = cue.startTime; });
        this.appendChild(btn);
      });
    };

    if (chaptersTrack.cues?.length) {
      render();
    } else {
      this.querySelector('track[kind="chapters"]')?.addEventListener('load', render, { once: true });
    }
  }

  /**
   * HLS stream ignores <track default> attribute, so we enable it manually:
   */
  showTextTrack() {
    const tracks = [...this.#video.textTracks].filter(t => t.kind === 'subtitles');
    const alreadyShowing = tracks.some(t => t.mode === 'showing');
    if (alreadyShowing) return;

    const defaultTrack = tracks.find(t => t.language === getLocale());
    if (defaultTrack) {
      defaultTrack.mode = 'showing';
    }
  }

  enhance() {
    videoBlockObserver.unobserve(this);
    if (this.#autoplay) {
      this.play({ focus: false });
    }
  }

  async play({ focus }: { focus: boolean }) {
    const Hls = await getHlsPlayer().then(({ default: Hls }) => Hls);
    const playAndFocus = () => {
      this.#video.play();
      this.showTextTrack();
      if (focus) {
        this.#video.focus();
      }
    };

    // prefer streaming with adaptive bitrate (HLS), fallback to mp4:
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(this.#streamingUrl as string);
      hls.attachMedia(this.#video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => playAndFocus());
      return;
    }
    if (this.#video.canPlayType('application/vnd.apple.mpegurl')) {
      this.#video.src = this.#streamingUrl as string;
      this.#video.addEventListener('loadedmetadata',() => playAndFocus());
      return;
    }
    this.#video.src = this.#mp4Url as string;
    playAndFocus();
  }
}

customElements.define('video-block', VideoBlock);
