import { renderToFragment } from '@lib/renderer';
import type { TextImageBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import TextImageBlock from './TextImageBlock.astro';

const fragment = await renderToFragment<{ block: TextImageBlockFragment }>(TextImageBlock, {
  props: {
    block: {
      layout: 'image-text',
      text: {
        value: {
          schema: 'dast',
          document: {
            type: 'root',
            children: [
              {
                type: 'heading',
                level: 1,
                children: [{ type: 'span', value: 'Welcome to My Blog!' }]
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'span',
                    value: 'This is a paragraph explaining the topic in detail.'
                  }
                ]
              }
            ]
          }
        },
        blocks: [],
        links: []
      },
      image: {
        url: 'https://via.placeholder.com/300',
        alt: 'Placeholder'
      }
    }
  }
});

describe('TextImageBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
