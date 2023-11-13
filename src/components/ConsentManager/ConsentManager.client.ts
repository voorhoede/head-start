import { atom, action, map } from 'nanostores';

export const $consent = map({
  'third_party': false,
  'third_party:video': false,
});

export const askConsent = action($consent, 'askConsent', async (store, key) => {
  const manager = document.querySelector('consent-manager') as ConsentManager;
  const value = await manager?.prompt();
  store.setKey(key, value);
});

class ConsentManager extends HTMLElement {
  #dialog?: HTMLDialogElement;
  constructor() {
    super();
    this.#dialog = this.querySelector('dialog') as HTMLDialogElement;
  }
  prompt() {
    return new Promise((resolve) => {
      this.#dialog?.addEventListener('close', () => {
        resolve(Boolean(this.#dialog?.returnValue));
      });
      this.#dialog?.showModal();
    });
  }
}

customElements.define('consent-manager', ConsentManager);
