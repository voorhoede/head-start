import { renderToFragment } from '@lib/renderer';
import type { EmbedBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import EmbedBlock from './EmbedBlock.astro';

const fragment = await renderToFragment<{ block: EmbedBlockFragment }>(EmbedBlock, {
  props: {
    block: {
      id: '123',
      url: 'https://example.com/',
      data: {}
    }
  }
});

describe('EmbedBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
