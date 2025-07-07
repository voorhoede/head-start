import { getLocale } from '@lib/i18n';
import { queryParamName } from '@lib/search';

class SearchFormBlock extends HTMLElement {
  #input: HTMLInputElement;

  constructor() {
    super();
    this.#input = this.querySelector('input[type="search"]') as HTMLInputElement;
  }

  #prefillInput() {
    // if input has a server-side value, keep that value:
    if (this.#input.value) {
      return;
    }
  
    // if URL has a query parameter, prefill the input with that value:
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get(queryParamName);
    if (query) {
      this.#input.value = query;
      return;
    }

    // otherwise, prefill with the prettified path name:
    const { pathname } = window.location;
    const locale = getLocale();
    const strippedPathname = pathname.startsWith(`/${locale}/`)
      ? pathname.slice(`/${locale}/`.length)
      : pathname;
    const prettyPathname = strippedPathname.replace(/[-/]/g, ' ');
    this.#input.value = prettyPathname;
  }

  connectedCallback() {
    if (!this.#input) {
      console.error('SearchFormBlock: No input[type="search"] found');
      return;
    }
    this.#prefillInput();
  }
}

customElements.define('search-form-block', SearchFormBlock);
