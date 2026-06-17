class Form extends HTMLElement {
  private initialHTML = '';

  connectedCallback() {
    this.initialHTML = this.innerHTML;
    this.addEventListener('submit', this);
    this.addEventListener('click', this);
  }

  disconnectedCallback() {
    this.removeEventListener('submit', this);
    this.removeEventListener('click', this);
  }

  handleEvent(event: Event) {
    if (event.type === 'click') {
      const target = event.target as HTMLElement;
      if (target.closest('[data-form-back]')) {
        event.preventDefault();
        this.innerHTML = this.initialHTML;
      }
      return;
    }

    if (event.type !== 'submit') return;
    event.preventDefault();

    const form = this.querySelector('form')!;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    submitButton?.setAttribute('disabled', 'true');

    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: new Headers({ 'x-requested-by': 'client' }),
    })
      .then(async (response) => ({
        html: await response.text(),
        ok: response.ok,
      }))
      .then(({ html, ok }) => {
        if (ok) {
          console.log('Form submission:', Object.fromEntries(formData));
        }
        this.innerHTML = html;
        if (!ok) {
          const errors = this.querySelectorAll<HTMLSpanElement>('.form-field__error');
          errors[0]?.scrollIntoView({ behavior: 'smooth' });
          errors[0]?.focus();
        }
      });
  }
}

customElements.define('web-form', Form);
