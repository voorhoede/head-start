import { cookieName } from '../../lib/i18n';

class LocaleSelector extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;
      if (!target || target.tagName !== 'A') {
        return;
      }
      if (!target.hreflang) {
        console.warn('LocaleSelector: missing required hreflang attribute', { target });
        return;
      }
      // set the hreflang cookie to the selected locale:
      document.cookie = `${cookieName}=${target.hreflang}; path=/`;
    });
  }
}

customElements.define('locale-selector', LocaleSelector);
