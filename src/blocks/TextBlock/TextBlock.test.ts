import { renderToFragment } from '@lib/renderer';
import type { TextBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import TextBlock from './TextBlock.astro';

const fragment = await renderToFragment<{ block: TextBlockFragment }>(TextBlock, {
  props: {
    block: {
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
      }
    }
  }
});

describe('TextBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
