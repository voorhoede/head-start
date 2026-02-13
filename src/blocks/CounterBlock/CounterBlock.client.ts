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
      // Measure and lock width immediately to prevent layout shift
      const formatted = this.#formatter.format(Number(el.dataset.target));
      el.textContent = formatted;
      el.style.width = `${el.offsetWidth}px`;
      el.textContent = '0';

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

    // Respect reduced motion preference
    if (this.#prefersReducedMotion) {
      el.textContent = this.#formatter.format(target);
      return;
    }

    const duration = Number(this.dataset.duration) || 1500;
    const startTime = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = this.#formatter.format(value);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = this.#formatter.format(target);
      }
    };

    requestAnimationFrame(update);
  }
}

customElements.define('counter-block', CounterBlock);

