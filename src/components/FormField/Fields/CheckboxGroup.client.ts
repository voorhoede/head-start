/**
 * HTML has no native "at least one required" for checkbox groups. Workaround: keep `required` 
 * on the first box only when nothing is checked, so the browser blocks submission with a 
 * native validation message. Without JS this constraint is skipped.
 */
class CheckboxGroup extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('required')) return;
    const boxes = [...this.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    const sync = () => {
      if (boxes[0]) boxes[0].required = !boxes.some((cb) => cb.checked);
    };
    boxes.forEach((cb) => cb.addEventListener('change', sync));
    sync();
  }
}

customElements.define('checkbox-group', CheckboxGroup);
