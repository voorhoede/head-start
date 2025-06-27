import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import HeadingBlock, { type Props } from './HeadingBlock.astro';

describe('HeadingBlock', () => {
  test('renders a heading with the proper data', async () => {
    const fragment = await renderToFragment<Props>(HeadingBlock, {
      props: {
        block: {
          id: '123',
          text: {
            'value': {
              'schema': 'dast',
              'document': {
                'type': 'root',
                'children': [
                  {
                    'type': 'paragraph',
                    'children': [
                      {
                        'type': 'span',
                        'value': 'test'
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    });

    const heading = fragment.querySelector('h2');
    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe('test');
    expect(heading?.querySelector('.paragraph')).toBeTruthy();
    
  });

  test('renders a heading level 3 when that level is provided', async () => {
    const fragment = await renderToFragment<Props>(HeadingBlock, {
      props: {
        block: {
          id: '123',
          text: {
            'value': {
              'schema': 'dast',
              'document': {
                'type': 'root',
                'children': [
                  {
                    'type': 'heading',
                    'children': [
                      {
                        'type': 'span',
                        'value': 'test'
                      }
                    ]
                  }
                ]
              }
            }
          },
          level: 3,
        }
      }
    });

    const heading = fragment.querySelector('h3');
    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe('test');
  });
  
  test('renders WYSIWYG heading level as a class of each containing element', async () => {
    const fragment = await renderToFragment<Props>(HeadingBlock, {
      props: {
        block: {
          id: '123',
          text: {
            'value': {
              'schema': 'dast',
              'document': {
                'type': 'root',
                'children': [
                  {
                    'type': 'heading',
                    'level': 2,
                    'children': [
                      {
                        'type': 'span',
                        'value': 'subtitle'
                      }
                    ]
                  },
                  {
                    'type': 'heading',
                    'level': 1,
                    'children': [
                      {
                        'type': 'span',
                        'value': 'title'
                      }
                    ]
                  }
                ]
              }
            }
          },
          level: 6,
        }
      }
    });

    const heading = fragment.querySelector('h6');
    expect(heading).toBeTruthy();
    const title = fragment.querySelector('.h1');
    const subtitle = fragment.querySelector('.h2');
    expect(title).toBeTruthy();
    expect(subtitle).toBeTruthy();
    expect(title?.textContent?.trim()).toBe('title');
    expect(subtitle?.textContent?.trim()).toBe('subtitle');
  });
});
