class Form extends HTMLElement {
  readonly #form: HTMLFormElement;
  readonly #submit: HTMLButtonElement;

  constructor() {
    super();
    this.#form = this.querySelector('form')!;
    this.#submit = this.querySelector('button[type="submit"]')!;
  }

  connectedCallback() {
    this.#form.addEventListener('submit', this);
  }

  disconnectedCallback() {
    this.#form.removeEventListener('submit', this);
  }

  handleEvent(event: Event) {
    event.preventDefault();
    if (event.type !== 'submit') return;
    const formData = new FormData(this.#form);

    this.#submit?.setAttribute('disabled', 'true');

    fetch(this.#form.action, {
      method: this.#form.method,
      body: formData,
    })
      .then(async (response) => ({
        html: await response.text(),
        status: response.status,
      }))
      .then((data) => {
        this.renderHtml(data.html);

        if (data.status !== 200) {
          const errors = this.querySelectorAll<HTMLSpanElement>('.form-field__error');
          errors?.[0].focus();
          errors?.[0].scrollIntoView({ behavior: 'smooth' });
        }

        this.#submit.removeAttribute('disabled');
      });
  }

  renderHtml(html: string) {
    try {
      const newFields = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector('.form--fields');
      if (newFields) {
        this.#form.querySelector('.form--fields')?.replaceWith(newFields);
      }
    } catch (error) {
      console.error(`Error rendering HTML: ${error}`);
    }
  }
}

customElements.define('web-form', Form);
