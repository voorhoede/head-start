import { pipeline } from '@huggingface/transformers';

const loadGenerator = pipeline('summarization', 'Xenova/distilbart-cnn-6-6');

const summarise = async (text: string) => {
  const generator = await loadGenerator;
  const output = await generator(text, {
    max_new_tokens: 50,
    num_beams: 2,
    temperature: 1,
    top_k: 0,
    do_sample: false,
    callback_function: function(beams) {
      const decodedText = generator.tokenizer.decode(beams[0].output_token_ids, {
        skip_special_tokens: true,
      });
      console.log('decodedText', decodedText);
    }
  });
  return output[0].summary_text;
};

addEventListener('message', (event) => {
  console.log('worker: summarising ...');
  console.time('worker: summarise time');
  summarise(event.data).then((summary) =>{
    postMessage(summary);
    console.timeEnd('worker: summarise time');
  });
});
