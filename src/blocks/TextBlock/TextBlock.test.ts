import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import TextBlock, { type Props } from './TextBlock.astro';

describe('TextBlock', () => {
  test('Component is rendered', async () => {
    const fragment = await renderToFragment<Props>(TextBlock, {
      props: {
        block: {
          __typename: 'TextBlockRecord',
          text: {
            blocks: [],
            links: [],
            value: {
              schema: 'dast',
              document: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    level: 1,
                    children: [
                      {
                        type: 'span',
                        value: 'This is a test'
                      }
                    ]
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'span',
                        value: 'This is a test'
                      },
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    });

    expect(fragment.querySelector('h2')?.textContent).toBe('This is a test');
    expect(fragment.querySelector('p')?.textContent).toBe('This is a test');
  });
});
