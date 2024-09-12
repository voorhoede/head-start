import { renderToFragment } from '@lib/renderer';
import type { PagePartialBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import PagePartialBlock from './PagePartialBlock.astro';

const fragment = await renderToFragment<{ block: PagePartialBlockFragment }>(PagePartialBlock, {
  props: {
    block: {
      id: '123',
      layout: 'full',
      items: [],
    }
  }
});

describe('PagePartialBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
