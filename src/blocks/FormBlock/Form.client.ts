type TurnstileApi = {
  render: (container: HTMLElement, params: Record<string, unknown>) => string;
};

class Form extends HTMLElement {
  private initialHTML = '';

  connectedCallback() {
    this.initialHTML = this.innerHTML;
    this.addEventListener('submit', this);
    this.addEventListener('click', this);
    this.gateSubmit();
  }

  disconnectedCallback() {
    this.removeEventListener('submit', this);
    this.removeEventListener('click', this);
  }

  private get submitButton() {
    return this.querySelector<HTMLButtonElement>('button[type="submit"]');
  }

  private gateSubmit() {
    const widget = this.querySelector<HTMLElement>('.cf-turnstile');
    const sitekey = widget?.getAttribute('data-sitekey') ?? '';
    if (!widget || sitekey.startsWith('<')) return;
    this.submitButton?.setAttribute('disabled', 'true');
  }

  private renderTurnstile() {
    const widget = this.querySelector<HTMLElement>('.cf-turnstile');
    const sitekey = widget?.getAttribute('data-sitekey') ?? '';
    const turnstile = (window as Window & { turnstile?: TurnstileApi }).turnstile;
    if (!widget || !turnstile || sitekey.startsWith('<')) return;
    turnstile.render(widget, {
      sitekey,
      callback: () => this.enableSubmit(),
      'error-callback': () => this.showError(),
    });
  }

  enableSubmit() {
    this.submitButton?.removeAttribute('disabled');
  }

  showError() {
    const template = this.querySelector<HTMLTemplateElement>('template[data-form-error]');
    if (template) {
      this.innerHTML = template.innerHTML;
    }
  }

  handleEvent(event: Event) {
    if (event.type === 'click') {
      const target = event.target as HTMLElement;
      if (target.closest('[data-form-back]')) {
        event.preventDefault();
        this.innerHTML = this.initialHTML;
        this.gateSubmit();
        this.renderTurnstile();
      }
      return;
    }

    if (event.type !== 'submit') return;
    event.preventDefault();
    this.submitForm();
  }

  private async submitForm() {
    const form = this.querySelector('form')!;
    const formData = new FormData(form);

    this.submitButton?.setAttribute('disabled', 'true');

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: new Headers({ 'x-requested-by': 'client' }),
      });

      if (response.status >= 500) {
        this.showError();
        return;
      }

      const html = await response.text();

      if (response.ok) {
        console.log('Form submission:', Object.fromEntries(formData));
      }

      this.innerHTML = html;

      if (!response.ok) {
        const errors = this.querySelectorAll<HTMLElement>('.form-field__error, .form__error');
        errors[0]?.scrollIntoView({ behavior: 'smooth' });
        errors[0]?.focus();
      }
    } catch {
      // Network failure or unreadable response — surface the error view.
      this.showError();
    }
  }
}

customElements.define('web-form', Form);

// Global callbacks referenced by the Turnstile widget (data-callback /
// data-error-callback). On success we enable the matching form's submit
// button; on error we surface the error view.
const turnstileWindow = window as Window & {
  onTurnstileSuccess?: () => void;
  onTurnstileError?: () => void;
};

turnstileWindow.onTurnstileSuccess = () => {
  document.querySelectorAll<Form>('web-form').forEach((form) => {
    const token = form.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
    if (token?.value) {
      form.enableSubmit();
    }
  });
};

turnstileWindow.onTurnstileError = () => {
  document.querySelectorAll<Form>('web-form').forEach((form) => form.showError());
};
