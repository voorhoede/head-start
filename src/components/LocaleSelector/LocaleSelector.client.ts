import { cookieName } from '../../lib/i18n';

class LocaleSelector extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target?.closest('a');
      if (!anchor?.hreflang) {
        console.warn('LocaleSelector: missing required hreflang attribute', { target });
        return;
      }
      // set the hreflang cookie to the selected locale:
      document.cookie = `${cookieName}=${anchor.hreflang}; path=/`;
    });
  }
}

customElements.define('locale-selector', LocaleSelector);
