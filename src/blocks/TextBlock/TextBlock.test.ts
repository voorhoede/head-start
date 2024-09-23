import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import TextBlock, { type Props } from './TextBlock.astro';

describe('TextBlock Component', () => {
  test('transforms a heading level 1 into heading level 2', async () => {
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
                        value: 'This is a test heading'
                      }
                    ]
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'span',
                        value: 'This is a test paragraph'
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

    expect(fragment.querySelector('h2')?.textContent).toBe('This is a test heading');
    expect(fragment.querySelector('p')?.textContent).toBe('This is a test paragraph');
  });

  test('renders a heading level 3 and a paragraph with the correct text content', async () => {
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
                    level: 3,
                    children: [
                      {
                        type: 'span',
                        value: 'This is a test heading'
                      }
                    ]
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'span',
                        value: 'This is a test paragraph'
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

    expect(fragment.querySelector('h3')?.textContent).toBe('This is a test heading');
    expect(fragment.querySelector('p')?.textContent).toBe('This is a test paragraph');
  });
});
