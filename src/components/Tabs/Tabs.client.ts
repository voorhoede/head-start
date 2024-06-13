/**
 * Tabs Component
 * Based on https://github.com/GoogleChromeLabs/howto-components/blob/master/elements/howto-tabs/howto-tabs.js
 * Added TypeScript support. Removed ShadyCSS. Updated fake private props (`_*`) with native private props (`#*`).
 */

// To avoid invoking the parser with `.innerHTML` for every new instance, a
// template for the contents of the shadow DOM is shared by all
// `<tabs-component>` instances.
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-wrap: wrap;
    }
    [role="tablist"] {
      display: flex;
      flex-wrap: wrap;
      position: relative;
    }
    ::slotted(tabs-panel) {
      flex-basis: 100%;
    }
  </style>
  <div role="tablist">
    <slot name="tab"></slot>
  </div>
  <slot name="panel"></slot>
`;

/**
 * `TabsComponent` is a container element for tabs and panels.
 *
 * All children of `<tabs-component>` should be either `<tabs-tab>` or
 * `<tabs-tabpanel>`. This element is stateless, meaning that no values are
 * cached and therefore, changes during runtime work.
 */
class TabsComponent extends HTMLElement {
  #tabSlot: HTMLSlotElement;
  #panelSlot: HTMLSlotElement;
  constructor() {
    super();

    // Event handlers that are not attached to this element need to be bound
    // if they need access to `this`.
    this.attachShadow({ mode: 'open' });
    // Import the shared template to create the slots for tabs and panels.
    const shadowRoot = this.shadowRoot as ShadowRoot;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.#tabSlot = shadowRoot.querySelector('slot[name=tab]') as HTMLSlotElement;
    this.#panelSlot = shadowRoot.querySelector('slot[name=panel]') as HTMLSlotElement;

    // This element needs to react to new children as it links up tabs and
    // panel semantically using `aria-labelledby` and `aria-controls`.
    // New children will get slotted automatically and cause `slotchange`
    // to fire, so not `MutationObserver` is needed.
    this.#tabSlot.addEventListener('slotchange', () => this.#onSlotChange());
    this.#panelSlot.addEventListener('slotchange', () => this.#onSlotChange());
  }

  /**
   * `connectedCallback()` groups tabs and panels by reordering and makes sure
   * exactly one tab is active.
   */
  connectedCallback() {
    // The element needs to do some manual input event handling to allow
    // switching with arrow keys and Home/End.
    this.addEventListener('keydown', this.#onKeyDown);
    this.addEventListener('click', this.#onClick);

    // Up until recently, `slotchange` events did not fire when an element was
    // upgraded by the parser. For this reason, the element invokes the
    // handler manually. Once the new behavior lands in all browsers, the code
    // below can be removed.
    Promise.all([
      customElements.whenDefined('tabs-tab'),
      customElements.whenDefined('tabs-panel'),
    ])
      .then(_ => this.#linkPanels());
  }

  /**
   * `disconnectedCallback()` removes the event listeners that
   * `connectedCallback` added.
   */
  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKeyDown);
    this.removeEventListener('click', this.#onClick);
  }

  /**
   * `#onSlotChange()` is called whenever an element is added or removed from
   * one of the shadow DOM slots.
   */
  #onSlotChange() {
    this.#linkPanels();
  }

  /**
   * `#linkPanels()` links up tabs with their adjacent panels using
   * `aria-controls` and `aria-labelledby`. Additionally, the method makes
   * sure only one tab is active.
   *
   * If this function becomes a bottleneck, it can be easily optimized by
   * only handling the new elements instead of iterating over all of the
   * element’s children.
   */
  #linkPanels() {
    const tabs = this.#allTabs();
    // Give each panel a `aria-labelledby` attribute that refers to the tab
    // that controls it.
    tabs.forEach(tab => {
      const panel = tab.nextElementSibling as TabsPanel;
      if (panel.tagName.toLowerCase() !== 'tabs-panel') {
        console.error(`Tab #${tab.id} is not a` +
          'sibling of a <tabs-panel>');
        return;
      }

      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', tab.id);
    });

    // The element checks if any of the tabs have been marked as selected.
    // If not, the first tab is now selected.
    const selectedTab =
      tabs.find(tab => tab.selected) || tabs[0];

    // Next, switch to the selected tab. `selectTab()` takes care of
    // marking all other tabs as deselected and hiding all other panels.
    this.#selectTab(selectedTab, false);
  }

  /**
   * `#allPanels()` returns all the panels in the tab panel. This function
   * could memoize the result if the DOM queries ever become a performance
   * issue. The downside of memoization is that dynamically added tabs and
   * panels will not be handled.
   *
   * This is a method and not a getter, because a getter implies that it is
   * cheap to read.
   */
  #allPanels() {
    return Array.from(this.querySelectorAll('tabs-panel')) as TabsPanel[];
  }

  /**
   * `#allTabs()` returns all the tabs in the tab panel.
   */
  #allTabs() {
    return Array.from(this.querySelectorAll('tabs-tab')) as TabsTab[];
  }

  /**
   * `#panelForTab()` returns the panel that the given tab controls.
   */
  #panelForTab(tab: TabsTab) {
    const panelId = tab.getAttribute('aria-controls');
    return this.querySelector(`#${panelId}`);
  }

  /**
   * `#prevTab()` returns the tab that comes before the currently selected
   * one, wrapping around when reaching the first one.
   */
  #prevTab() {
    const tabs = this.#allTabs();
    // Use `findIndex()` to find the index of the currently
    // selected element and subtracts one to get the index of the previous
    // element.
    const newIdx =
      tabs.findIndex(tab => tab.selected) - 1;
    // Add `tabs.length` to make sure the index is a positive number
    // and get the modulus to wrap around if necessary.
    return tabs[(newIdx + tabs.length) % tabs.length];
  }

  /**
   * `#firstTab()` returns the first tab.
   */
  #firstTab() {
    const tabs = this.#allTabs();
    return tabs[0];
  }

  /**
   * `#lastTab()` returns the last tab.
   */
  #lastTab() {
    const tabs = this.#allTabs();
    return tabs[tabs.length - 1];
  }

  /**
   * `#nextTab()` gets the tab that comes after the currently selected one,
   * wrapping around when reaching the last tab.
   */
  #nextTab() {
    const tabs = this.#allTabs();
    const newIdx = tabs.findIndex(tab => tab.selected) + 1;
    return tabs[newIdx % tabs.length];
  }

  /**
   * `reset()` marks all tabs as deselected and hides all the panels.
   */
  reset() {
    const tabs = this.#allTabs();
    const panels = this.#allPanels();

    tabs.forEach(tab => tab.selected = false);
    panels.forEach(panel => panel.hidden = true);
  }


  /**
   * `#selectTab()` marks the given tab as selected.
   * Additionally, it unhides the panel corresponding to the given tab.
   */
  #selectTab(newTab: TabsTab, autofocus = true) {
    // Deselect all tabs and hide all panels.
    this.reset();

    // Get the panel that the `newTab` is associated with.
    const newPanel = this.#panelForTab(newTab) as TabsPanel;
    // If that panel doesn’t exist, abort.
    if (!newPanel)
      throw new Error(`No panel with id ${newTab.getAttribute('aria-controls')}`);
    newTab.selected = true;
    newPanel.hidden = false;
    if (autofocus) {
      newTab.focus();
    }
  }

  /**
   * `#onKeyDown()` handles key presses inside the tab panel.
   */
  #onKeyDown(event: KeyboardEvent) {
    // If the keypress did not originate from a tab element itself,
    // it was a keypress inside the a panel or on empty space. Nothing to do.
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'tab')
      return;
    // Don’t handle modifier shortcuts typically used by assistive technology.
    if (event.altKey)
      return;

    // The switch-case will determine which tab should be marked as active
    // depending on the key that was pressed.
    let newTab;

    switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      newTab = this.#prevTab();
      break;

    case 'ArrowRight':
    case 'ArrowDown':
      newTab = this.#nextTab();
      break;

    case 'Home':
      newTab = this.#firstTab();
      break;

    case 'End':
      newTab = this.#lastTab();
      break;
      // Any other key press is ignored and passed back to the browser.
    default:
      return;
    }

    // The browser might have some native functionality bound to the arrow
    // keys, home or end. The element calls `preventDefault()` to prevent the
    // browser from taking any actions.
    event.preventDefault();
    // Select the new tab, that has been determined in the switch-case.
    this.#selectTab(newTab);
  }

  /**
   * `#onClick()` handles clicks inside the tab panel.
   */
  #onClick(event: MouseEvent) {
    // If the click was not targeted on a tab element itself,
    // it was a click inside the a panel or on empty space. Nothing to do.
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'tab')
      return;
    // If it was on a tab element, though, select that tab.
    this.#selectTab(target as TabsTab);
  }
}
customElements.define('tabs-component', TabsComponent);

// `tabsTabCounter` counts the number of `<tabs-tab>` instances created. The
// number is used to generated new, unique IDs.
let tabsTabCounter = 0;
/**
 * `TabsTab` is a tab for a `<tabs-component>` tab panel. `<tabs-tab>`
 * should always be used with `role=heading` in the markup so that the
 * semantics remain useable when JavaScript is failing.
 *
 * A `<tabs-tab>` declares which `<tabs-panel>` it belongs to by
 * using that panel’s ID as the value for the `aria-controls` attribute.
 *
 * A `<tabs-tab>` will automatically generate a unique ID if none
 * is specified.
 */
class TabsTab extends HTMLElement {
  static get observedAttributes() {
    return ['selected'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    // If this is executed, JavaScript is working and the element
    // changes its role to `tab`.
    this.setAttribute('role', 'tab');
    if (!this.id)
      this.id = `tabs-tab-generated-${tabsTabCounter++}`;

    // Set a well-defined initial state.
    this.setAttribute('aria-selected', 'false');
    this.setAttribute('tabindex', '-1');
    this.#upgradeProperty('selected');
  }

  /**
  * Check if a property has an instance value. If so, copy the value, and
  * delete the instance property so it doesn't shadow the class property
  * setter. Finally, pass the value to the class property setter so it can
  * trigger any side effects.
  * This is to safe guard against cases where, for instance, a framework
  * may have added the element to the page and set a value on one of its
  * properties, but lazy loaded its definition. Without this guard, the
  * upgraded element would miss that property and the instance property
  * would prevent the class property setter from ever being called.
  */
  #upgradeProperty(prop: keyof this) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  /**
   * Properties and their corresponding attributes should mirror one another.
   * To this effect, the property setter for `selected` handles truthy/falsy
   * values and reflects those to the state of the attribute. It’s important
   * to note that there are no side effects taking place in the property
   * setter. For example, the setter does not set `aria-selected`. Instead,
   * that work happens in the `attributeChangedCallback`. As a general rule,
   * make property setters very dumb, and if setting a property or attribute
   * should cause a side effect (like setting a corresponding ARIA attribute)
   * do that work in the `attributeChangedCallback()`. This will avoid having
   * to manage complex attribute/property reentrancy scenarios.
   */
  attributeChangedCallback() {
    const value = this.hasAttribute('selected');
    this.setAttribute('aria-selected', String(value));
    this.setAttribute('tabindex', value ? '0' : '-1');
  }

  set selected(value) {
    value = Boolean(value);
    if (value)
      this.setAttribute('selected', '');
    else
      this.removeAttribute('selected');
  }

  get selected() {
    return this.hasAttribute('selected');
  }
}
customElements.define('tabs-tab', TabsTab);

let tabsPanelCounter = 0;
/**
 * `TabsPanel` is a panel for a `<tabs-component>` tab panel.
 */
class TabsPanel extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute('role', 'tabpanel');
    if (!this.id)
      this.id = `tabs-panel-generated-${tabsPanelCounter++}`;
  }
}
customElements.define('tabs-panel', TabsPanel);
