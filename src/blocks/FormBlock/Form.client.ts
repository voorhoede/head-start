class Form extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('submit', this);
  }

  disconnectedCallback() {
  }

  handleEvent(event: Event) {
    event.preventDefault();
    if (event.type !== 'submit') return;
    const form = this.querySelector('form')!;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    submitButton?.setAttribute('disabled', 'true');

    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: new Headers({
        'x-requested-by': 'client'
      })
    })
      .then(async (response) => ({
        html: await response.text(),
        status: response.status,
      }))
      .then((data) => {
        this.innerHTML = data.html;
        if (data.status !== 200) {
          const errors = this.querySelectorAll<HTMLSpanElement>('.form-field__error');
          errors?.[0].focus();
          errors?.[0].scrollIntoView({ behavior: 'smooth' });
        }

        submitButton?.removeAttribute('disabled');
      });
  }
}

customElements.define('web-form', Form);
