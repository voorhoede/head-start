import { persistentMap } from '@nanostores/persistent';

const highContrastMediaQuery = '(forced-colors: active), (prefers-contrast: more)';

type HighContrastMap = {
  isSystemInHighContrastMode: boolean;
  isHighContrastModeEnabledByUser: boolean;
  isEnabled: boolean;
}
const defaultHighContrast: HighContrastMap = {
  isSystemInHighContrastMode: window.matchMedia(highContrastMediaQuery).matches,
  isHighContrastModeEnabledByUser: false,
  isEnabled: false,
};
export const $highContrast = persistentMap<HighContrastMap>(
  'ChartBlock:highContrast:',
  defaultHighContrast,
  {
    decode: JSON.parse,
    encode: JSON.stringify,
  }
);

const setIsHighContrastEnabled = () => {
  const highContrast = $highContrast.get();
  const isEnabled = highContrast.isSystemInHighContrastMode || highContrast.isHighContrastModeEnabledByUser;
  $highContrast.setKey('isEnabled', isEnabled); // @todo: make computed property?
};
setIsHighContrastEnabled();

window.matchMedia(highContrastMediaQuery).addEventListener('change', () => {
  const newValue = window.matchMedia(highContrastMediaQuery).matches;
  $highContrast.setKey('isSystemInHighContrastMode', newValue);
  setIsHighContrastEnabled();
});

class ChartBlock extends HTMLElement {
  #contrastButton: HTMLButtonElement | null = null;

  constructor() {
    super();
    this.#contrastButton = this.querySelector('button[data-contrast-button]');
    this.#setContrastMode();
  }

  connectedCallback() {
    this.#contrastButton?.addEventListener('click', this.#onContrastButtonClick.bind(this));
  }

  disconnectCallback() {
    this.#contrastButton?.removeEventListener('click', this.#onContrastButtonClick.bind(this));
  }

  #onContrastButtonClick() {
    const newValue = !$highContrast.get().isHighContrastModeEnabledByUser;
    $highContrast.setKey('isHighContrastModeEnabledByUser', newValue);
    this.#setContrastMode();
  }

  #setContrastMode() {
    const highContrast = $highContrast.get();
    this.#contrastButton?.setAttribute('aria-pressed', String(highContrast.isHighContrastModeEnabledByUser));
    setIsHighContrastEnabled();
  }
}

customElements.define('chart-block', ChartBlock);
