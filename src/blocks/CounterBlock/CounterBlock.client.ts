import { getLocale } from '@lib/i18n';

class CounterBlock extends HTMLElement {
  #observer?: IntersectionObserver;
  #prefersReducedMotion = false;
  #formatter = new Intl.NumberFormat(getLocale());

  constructor() {
    super();
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this.#prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  connectedCallback() {
    if (!this.#observer) {
      this.#observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target instanceof HTMLSpanElement) {
              this.#animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
    }

    const counters = Array.from(this.querySelectorAll<HTMLSpanElement>('[data-counter-number]'));
    counters.forEach((el) => {
      const target = Number(el.dataset.target);
      if (Number.isNaN(target)) return;

      // Pre-format the initial value to ensure consistent decimal places during animation
      const fractionDigits = this.#getFractionDigits(target);
      const animationFormatter = this.#getAnimationFormatter(fractionDigits);
      el.textContent = animationFormatter.format(0);

      this.#observer?.observe(el);
    });
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = undefined;
  }

  #animateCounter(el: HTMLSpanElement) {
    const target = Number(el.dataset.target);
    if (Number.isNaN(target)) return;

    const fractionDigits = this.#getFractionDigits(target);
    const animationFormatter = this.#getAnimationFormatter(fractionDigits);

    // Respect reduced motion preference
    if (this.#prefersReducedMotion) {
      el.textContent = this.#formatter.format(target);
      return;
    }

    const duration = Number(this.dataset.duration) || 1500;
    const startTime = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const scaled = progress * target;
      const factor = 10 ** fractionDigits;
      const value = Math.trunc(scaled * factor) / factor;
      el.textContent = animationFormatter.format(value);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = this.#formatter.format(target);
      }
    };

    requestAnimationFrame(update);
  }

  #getFractionDigits(value: number) {
    return this.#formatter.formatToParts(value).find((part) => part.type === 'fraction')?.value.length ?? 0;
  }

  #getAnimationFormatter(fractionDigits: number) {
    return new Intl.NumberFormat(getLocale(), {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }
}

customElements.define('counter-block', CounterBlock);

