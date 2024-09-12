import { renderToFragment } from '@lib/renderer';
import type { TableBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import TableBlock from './TableBlock.astro';

const fragment = await renderToFragment<{ block: TableBlockFragment }>(TableBlock, {
  props: {
    block: {
      _modelApiKey: 'table_block',
      id: '123',
      title: 'Table Block',
      table: {
        columns: ['Name', 'Age'],
        data: [
          { Name: 'John Doe', Age: '30' },
          { Name: 'Jane Doe', Age: '25' }
        ]
      },
      hasHeaderRow: true,
      hasHeaderColumn: true
    }
  }
});

describe('TableBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
