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
    this.submitForm();
  }

  private async submitForm() {
    const form = this.querySelector('form')!;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    submitButton?.setAttribute('disabled', 'true');

    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: new Headers({ 'x-requested-by': 'client' }),
    });

    const html = await response.text();

    if (response.ok) {
      console.log('Form submission:', Object.fromEntries(formData));
    }

    if (!response.ok && response.status >= 500) {
      submitButton?.removeAttribute('disabled');
      return;
    }

    this.innerHTML = html;

    if (!response.ok) {
      const errors = this.querySelectorAll<HTMLElement>('.form-field__error, .form__error');
      errors[0]?.scrollIntoView({ behavior: 'smooth' });
      errors[0]?.focus();
    }
  }
}

customElements.define('web-form', Form);
