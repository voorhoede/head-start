class FormBlock extends HTMLElement {
  #form: HTMLFormElement;

  constructor() {
    super();
    this.#form = this.querySelector('form') as HTMLFormElement;
  }

  connectedCallback() {
    if (!this.#form) {
      console.warn('FormBlock: missing form element', this);
      return;
    }
    this.#form.addEventListener('submit', this.#onSubmit.bind(this));
  }

  disconnectedCallback() {
  }

  #onSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(this.#form);

    fetch(this.#form.action, {
      method: this.#form.method,
      body: formData,
      headers: {
        // 'Accept': 'application/json',
      },
    })
      // @todo: make this handler even dumber, just replace returned HTML regardless?
      // .then(response => response.json())
      // .then(data => {
      //   console.log('Form submitted successfully:', data);
      //   this.#form.innerHTML = data.html || '<p>Form submitted successfully!</p>';
      // })
      // .catch(error => {
      //   console.error('Error submitting form:', error);
      // });
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(html => {
        // Replace the form with the returned HTML
        this.#form.innerHTML = html;
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        this.#form.innerHTML = `<p>Error submitting form: ${error.message}</p>`;
      });
  }
}

customElements.define('form-block', FormBlock);
