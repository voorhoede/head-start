import { cookieName } from '@lib/i18n';
import { onConsentChange } from '@components/ConsentManager/ConsentManger.client';

const consentKey = 'hs-locale';

class LocaleSelector extends HTMLElement {
  #unsubscribeOnConsent = () => {};
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('click', this.#onClick.bind(this));
    this.#unsubscribeOnConsent = onConsentChange(consentKey, (hasConsent) => {
      console.log('LocaleSelector: consent?', hasConsent);
      if (!hasConsent) this.#removeCookie();
    });
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#onClick.bind(this));
    this.#unsubscribeOnConsent();
  }

  #onClick(event: MouseEvent) {
    const target = event.target as HTMLAnchorElement;
    if (!target || target.tagName !== 'A') {
      return;
    }
    if (!target.hreflang) {
      console.warn('LocaleSelector: missing required hreflang attribute', { target });
      return;
    }

    this.#setCookie(target.hreflang);
  }

  #setCookie(value: string) {
    document.cookie = `${cookieName}=${value}; path=/`;
  }

  #removeCookie() {
    document.cookie = `${cookieName}=; path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
}

customElements.define('locale-selector', LocaleSelector);
