type TurnstileApi = {
  render: (container: HTMLElement, params: Record<string, unknown>) => string;
  reset: (container?: HTMLElement) => void;
};

const turnstileWindow = window as Window & {
  turnstile?: TurnstileApi;
  onTurnstileSuccess?: () => void;
  onTurnstileError?: () => void;
};

function createError(tag: 'p' | 'span', className: string, message: string) {
  const error = document.createElement(tag);
  error.className = className;
  error.setAttribute('role', 'alert');
  error.textContent = message;
  return error;
}

class Form extends HTMLElement {
  connectedCallback() {
    this.addEventListener('submit', this);
    this.addEventListener('click', this);
    this.gateSubmit();
  }

  disconnectedCallback() {
    this.removeEventListener('submit', this);
    this.removeEventListener('click', this);
  }

  handleEvent(event: Event) {
    if (event.type === 'submit') {
      event.preventDefault();
      this.submitForm();
      return;
    }
    if (event.type === 'click' && (event.target as HTMLElement).closest('[data-form-back]')) {
      event.preventDefault();
      this.restore();
    }
  }

  private get submitButton() {
    return this.querySelector<HTMLButtonElement>('button[type="submit"]');
  }

  private get turnstile() {
    const widget = this.querySelector<HTMLElement>('.cf-turnstile');
    const sitekey = widget?.getAttribute('data-sitekey') ?? '';
    return widget && !sitekey.startsWith('<') ? { widget, sitekey } : null;
  }

  enableSubmit() {
    this.submitButton?.removeAttribute('disabled');
  }

  private disableSubmit() {
    this.submitButton?.setAttribute('disabled', 'true');
  }

  showError() {
    const template = this.querySelector<HTMLTemplateElement>('template[data-form-error]');
    if (template) this.showView(template.innerHTML);
  }

  private showView(html: string) {
    const form = this.querySelector('form');
    if (!form || this.querySelector('[data-form-view]')) return;
    form.hidden = true;
    const view = document.createElement('div');
    view.dataset.formView = '';
    view.innerHTML = html;
    this.append(view);
  }

  private restore() {
    this.querySelector('[data-form-view]')?.remove();
    const form = this.querySelector('form');
    if (form) form.hidden = false;
    this.gateSubmit();
    this.resetTurnstile();
  }

  /** 
   * Keeps submit disabled until Turnstile passes. 
   */
  private gateSubmit() {
    if (this.turnstile) this.disableSubmit();
  }

  /** Issues a fresh single-use token for a retry, or re-enables submit if there's no widget. */
  private resetTurnstile() {
    const turnstile = this.turnstile;
    if (turnstile && turnstileWindow.turnstile) {
      turnstileWindow.turnstile.reset(turnstile.widget);
    } else {
      this.enableSubmit();
    }
  }

  private async submitForm() {
    const form = this.querySelector('form')!;
    const formData = new FormData(form);
    this.clearFieldErrors();
    this.disableSubmit();

    let response: Response;
    try {
      response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: new Headers({ 'x-requested-by': 'client' }),
      });
    } catch {
      this.showError();
      return;
    }

    if (response.status >= 500) {
      this.showError();
      return;
    }

    // 400: validation errors arrive as JSON — inject them inline so the user's
    // input and the solved Turnstile widget stay intact.
    if (response.status === 400) {
      const errors = await response.json().then((data) => data.errors).catch(() => null);
      if (errors) {
        this.showFieldErrors(errors);
      } else {
        this.showError();
      }
      return;
    }

    if (response.ok) {
      form.reset();
      this.showView(await response.text());
      return;
    }
    this.showError();
  }

  private clearFieldErrors() {
    const form = this.querySelector('form');
    if (!form) return;
    form.querySelectorAll('.form-field__error, .form__error').forEach((el) => el.remove());
    form.querySelectorAll('.form-field--error').forEach((el) => el.classList.remove('form-field--error'));
  }

  private showFieldErrors(errors: Record<string, string>) {
    const form = this.querySelector('form');
    if (!form) return;

    this.clearFieldErrors();

    let firstError: HTMLElement | null = null;

    for (const [name, message] of Object.entries(errors)) {
      let error: HTMLElement | null = null;
      if (name === 'turnstileError') {
        error = createError('p', 'form__error', message);
        form.prepend(error);
      } else {
        const wrapper = form.querySelector(`[name="${name}"]`)?.closest<HTMLElement>('.form-field');
        if (wrapper) {
          wrapper.classList.add('form-field--error');
          error = createError('span', 'form-field__error', message);
          wrapper.append(error);
        }
      }
      firstError ??= error;
    }

    this.resetTurnstile();
    firstError?.scrollIntoView({ behavior: 'smooth' });
    firstError?.focus();
  }
}

customElements.define('web-form', Form);

turnstileWindow.onTurnstileSuccess = () => {
  document.querySelectorAll<Form>('web-form').forEach((form) => {
    const token = form.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
    if (token?.value) form.enableSubmit();
  });
};

turnstileWindow.onTurnstileError = () => {
  document.querySelectorAll<Form>('web-form').forEach((form) => form.showError());
};
