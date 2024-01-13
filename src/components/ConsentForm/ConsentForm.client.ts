import { setConsentMap } from '@components/ConsentManager/ConsentManger.client';

class ConsentForm extends HTMLFormElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('submit', this.#handleSubmit.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener('submit', this.#handleSubmit.bind(this));
  }

  #handleSubmit(event: Event) {
    event.preventDefault();
    const checkboxes = Array.from(this.querySelectorAll('input[type="checkbox"][name]')) as HTMLInputElement[];
    const consentMap = checkboxes.reduce((map, checkbox) => ({ ...map, [checkbox.name]: checkbox.checked }), {});
    setConsentMap(consentMap);
  }
}

customElements.define('consent-form', ConsentForm, { extends: 'form' });

class ConsentFormGroup extends HTMLElement {
  #summaryCheckbox: HTMLInputElement;
  #itemCheckboxes: HTMLInputElement[];
  constructor() {
    super();
    this.#summaryCheckbox = this.querySelector('summary input[type="checkbox"]') as HTMLInputElement;
    this.#itemCheckboxes = Array.from(this.querySelectorAll('li input[type="checkbox"]'));
  }

  connectedCallback() {
    if (!this.#summaryCheckbox) {
      console.warn('ConsentFormGroup: missing summary checkbox', this);
      return;
    }
    this.#summaryCheckbox.addEventListener('change', this.#handleSummaryChange.bind(this));
    this.#itemCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this.#handleItemChange.bind(this));
    });
    this.#summaryCheckbox.removeAttribute('hidden');
  }

  disconnectedCallback() {
    this.#summaryCheckbox.removeEventListener('change', this.#handleSummaryChange.bind(this));
    this.#itemCheckboxes.forEach((checkbox) => {
      checkbox.removeEventListener('change', this.#handleItemChange.bind(this));
    });
  }

  #handleSummaryChange() {
    const checked = this.#summaryCheckbox.checked;
    this.#itemCheckboxes.forEach((checkbox) => {
      checkbox.checked = checked;
    });
  }

  #handleItemChange() {
    const allChecked = this.#itemCheckboxes.every((checkbox) => checkbox.checked);
    const noneChecked = this.#itemCheckboxes.every((checkbox) => !checkbox.checked);
    if (allChecked) {
      this.#summaryCheckbox.checked = true;
      this.#summaryCheckbox.indeterminate = false;
    } else if (noneChecked) {
      this.#summaryCheckbox.checked = false;
      this.#summaryCheckbox.indeterminate = false;
    } else /* partially checked */ {
      this.#summaryCheckbox.checked = false;
      this.#summaryCheckbox.indeterminate = true;
    }
  }
}

customElements.define('consent-form-group', ConsentFormGroup);
