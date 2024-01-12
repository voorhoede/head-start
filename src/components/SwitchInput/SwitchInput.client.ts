/**
 * Based on https://github.com/argyleink/gui-challenges/blob/main/switch/index.js
 * Adapted to Custom Element with types.
 * Unlike original, doesn't prevent event bubbling, so it plays nicely with other components.
 */

const getStyle = (element: HTMLElement, prop: string) => {
  return parseInt(window.getComputedStyle(element).getPropertyValue(prop));
};

const getPseudoStyle = (element: HTMLElement, prop: string) => {
  return parseInt(window.getComputedStyle(element, ':before').getPropertyValue(prop));
};

type Bounds = {
  lower: number;
  middle: number;
  upper: number;
};

class SwitchInput extends HTMLInputElement {
  #thumbsize: number = 0;
  #padding: number = 0;
  #bounds: Bounds = { lower: 0, middle: 0, upper: 0 };
  #isDragging = false;
  constructor() {
    super();
    this.#thumbsize = getPseudoStyle(this, 'width');
    this.#padding = getStyle(this, 'padding-left') + getStyle(this, 'padding-right');
    this.#bounds = {
      lower: 0,
      middle: (this.clientWidth - this.#padding) / 4,
      upper: this.clientWidth - this.#thumbsize - this.#padding,
    };
  }

  connectedCallback() {
    this.addEventListener('pointerdown', this.#dragInit.bind(this));
    this.addEventListener('pointerup', this.#dragEnd.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener('pointerdown', this.#dragInit.bind(this));
    this.removeEventListener('pointerup', this.#dragEnd.bind(this));
  }

  #dragInit() {
    if (this.disabled) return;
    this.#isDragging = true;
    this.addEventListener('pointermove', this.#dragging.bind(this));
    this.style.setProperty('--thumb-transition-duration', '0s');
    window.addEventListener('pointerup', this.#dragEnd.bind(this));
  }

  #dragging(event: PointerEvent) {
    if (!this.#isDragging) return;
    const directionality = getStyle(this, '--isLTR');
    const trackPosition = (directionality === -1)
      ? (this.clientWidth * -1) + this.#thumbsize + this.#padding
      : 0;
    const pointerPosition = 
      Math.min(
        Math.max(
          event.offsetX - this.#thumbsize / 2,
          this.#bounds.lower
        ),
        this.#bounds.upper
      );
    const thumbPosition = trackPosition + pointerPosition;
    this.style.setProperty('--thumb-position', `${thumbPosition}px`);
  }

  #dragEnd() {
    if (!this.#isDragging) return;
  
    this.#isDragging = false;
    this.checked = !this.#determineChecked();
    this.indeterminate = false;

    this.style.removeProperty('--thumb-transition-duration');
    this.style.removeProperty('--thumb-position');
  
    this.removeEventListener('pointermove', this.#dragging.bind(this));
    window.removeEventListener('pointerup', this.#dragEnd.bind(this));
  }

  #determineChecked() {
    let thumbPosition = Math.abs(parseInt(this.style.getPropertyValue('--thumb-position')));
    if (!thumbPosition) {
      thumbPosition = this.checked
        ? this.#bounds.lower
        : this.#bounds.upper;
    }
    return thumbPosition >= this.#bounds.middle;
  }
}

customElements.define('switch-input', SwitchInput, { extends: 'input' });
