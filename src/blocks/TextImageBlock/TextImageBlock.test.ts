import { renderToFragment } from '@lib/renderer';
import type { TextImageBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import TextImageBlock from './TextImageBlock.astro';

describe('TextImageBlock', () => {
  test('renders with "text-image" layout correctly', async () => {
    const fragment = await renderToFragment<{ block: TextImageBlockFragment }>(TextImageBlock, {
      props: {
        block: {
          layout: 'text-image',
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
          },
          image: {
            url: 'https://via.placeholder.com/300',
            alt: 'Placeholder'
          }
        }
      }
    });

    expect(fragment.querySelector('.layout--text-image')).toBeTruthy();
  });

  test('renders with "image-text" layout correctly', async () => {
    const fragment = await renderToFragment<{ block: TextImageBlockFragment }>(TextImageBlock, {
      props: {
        block: {
          layout: 'image-text',
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
          },
          image: {
            url: 'https://via.placeholder.com/300',
            alt: 'Placeholder'
          }
        }
      }
    });

    expect(fragment.querySelector('.layout--image-text')).toBeTruthy();
  });
});
