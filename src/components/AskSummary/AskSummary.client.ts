// import { pipeline } from '@huggingface/transformers';

const worker = new Worker('./AskSummary.worker.ts', { type: 'module' });

class AskSummary extends HTMLElement {
  formElement: HTMLFormElement;
  outputElement: HTMLOutputElement;
  sourceUrl: string;
  // #generatorPromise: Promise<any>;

  constructor() {
    super();
    this.formElement = this.querySelector<HTMLFormElement>('form')!;
    this.outputElement = this.querySelector<HTMLOutputElement>('output')!;
    this.sourceUrl = new URL(this.dataset.sourceUrl!, window.location.origin).href;
  }

  #getContent = async () => {
    const response = await fetch(this.sourceUrl);
    return response.text();
  };

  // #loadGenerator = async () => {
  //   if (typeof this.#generatorPromise !== 'undefined') {
  //     return this.#generatorPromise;
  //   }
  //   console.log('loading summariser');
  //   this.#generatorPromise = pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
  //   this.#generatorPromise.then(() => console.log('summariser loaded'));
  //   return this.#generatorPromise;
  // };

  #summarise = async (text: string) => {
    console.log('to do: summarise text');
    // const generator = await this.#loadGenerator();
    // console.time('summarise');
    // const output = await generator(text, {
    //   max_new_tokens: 50,
    //   num_beams: 2,
    //   temperature: 1,
    //   top_k: 0,
    //   do_sample: false,
    //   callback_function: function(beams) {
    //     const decodedText = generator.tokenizer.decode(beams[0].output_token_ids, {
    //       skip_special_tokens: true,
    //     });
    //     console.log('decodedText', decodedText);
    //   }
    // });
    // console.timeEnd('summarise');
    // return output[0].summary_text;
    return new Promise((resolve) => {
      worker.addEventListener('message', (event) => {
        console.log('client said:', event.data);
        resolve(event.data);
      });
      worker.postMessage(text);
    });
  };

  connectedCallback(): void {
    // this.#loadGenerator();
    this.formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      this.outputElement.value = 'reading and summarising...';
      this.#getContent()
        .then((content) => this.#summarise(content))
        .then((text) => {
          this.outputElement.value = text;
        });
    });
  }

  // disconnectedCallback(): void {
  // }
}

customElements.define('ask-summary', AskSummary);
