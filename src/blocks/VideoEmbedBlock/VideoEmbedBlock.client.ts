// Each video embed has its own video url (configured as data attribute),
// so we use a custom element to porgressively enhance each instance:
// @ see https://docs.astro.build/en/guides/client-side-scripts/#web-components-with-custom-elements
class VideoEmbed extends HTMLElement {
  constructor() {
    super();
    const anchor = this.querySelector('a');
    const iframe = this.querySelector('iframe');
    const { autoplay, videoUrl } = this.dataset;

    if (!anchor || !iframe || !videoUrl) {
      console.warn('VideoEmbedBlock: missing required elements/attributes', { anchor, iframe, videoUrl });
      return;
    }

    let isPlaying = false;
    function play() {
      if (isPlaying) return;
      iframe.src = videoUrl;
      iframe.removeAttribute('hidden');
      iframe.focus();
      anchor.setAttribute('hidden', '');
      isPlaying = true;
    }
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      play();
    });
    if (autoplay) {
      play();
    }
  }
}
customElements.define('video-embed', VideoEmbed);
