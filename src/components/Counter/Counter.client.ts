import { CountUp } from 'countUp.js';
import { getLocale } from '@lib/i18n';
import { getFractionDigits, getSeparators } from './Counter';

class CounterComponent extends HTMLElement {
  #placeholder: HTMLElement;
  #output: HTMLElement;
  #value: number;

  constructor() {
    super();
    this.#placeholder = this.querySelector('[data-placeholder]') as HTMLElement;
    this.#output = this.querySelector('[data-output]') as HTMLElement;
    this.#value = parseFloat(this.dataset.value ?? '0');
  }

  connectedCallback() {
    const isMotionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (isMotionOk) {
      this.enhance();
    }
  }

  enhance() {
    const locale = getLocale();
    const { groupSeparator, decimalSeparator } = getSeparators(locale);
    const options = {
      useEasing: true,
      useGrouping: true,
      separator: groupSeparator,
      decimal: decimalSeparator,
      decimalPlaces: getFractionDigits(this.#value),
      enableScrollSpy: true,
      scrollSpyDelay: 0,
      scrollSpyOnce: true,
    };

    const countUp = new CountUp(this.#output, this.#value, options);

    countUp.start();

    this.#placeholder.setAttribute('aria-hidden', 'true');
  }
}

customElements.define('counter-component', CounterComponent);
