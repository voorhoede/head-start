import { pipeline } from '@huggingface/transformers';

class AskQuestion extends HTMLElement {
  formElement: HTMLFormElement;
  textInputElement: HTMLTextAreaElement;
  outputElement: HTMLOutputElement;
  sourceUrl: string;
  #generatorPromise: Promise<unknown> | undefined;

  constructor() {
    super();
    this.formElement = this.querySelector<HTMLFormElement>('form')!;
    this.textInputElement = this.querySelector<HTMLTextAreaElement>('textarea')!;
    this.outputElement = this.querySelector<HTMLOutputElement>('output')!;
    this.sourceUrl = new URL(this.dataset.sourceUrl!, window.location.origin).href;
  }

  #getContent = async () => {
    const response = await fetch(this.sourceUrl);
    return response.text();
  };

  #loadGenerator = async () => {
    if (typeof this.#generatorPromise !== 'undefined') {
      return this.#generatorPromise;
    }
    console.log('loading answerer');
    this.#generatorPromise = pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad');
    this.#generatorPromise.then(() => console.log('answerer loaded'));
    return this.#generatorPromise;
  };

  #answerQuestion = async (question: string, context: string) => {
    console.log('to do: answer question', question);
    const generator = await this.#loadGenerator();
    console.time('answering');
    const output = await generator(question, context);
    console.timeEnd('answering');
    console.log('output', output);
    return output.answer;
  };

  connectedCallback(): void {
    this.textInputElement.addEventListener('focus', () => {
      this.#loadGenerator();
    });
    this.formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      this.outputElement.value = 'reading and formulating answer...';
      this.#getContent()
        .then((content) => this.#answerQuestion(this.textInputElement.value, content))
        .then((answer) => {
          console.log({ answer });
          this.outputElement.value = answer;
        });
    });
  }

  // disconnectedCallback(): void {
  // }
}

customElements.define('ask-question', AskQuestion);
