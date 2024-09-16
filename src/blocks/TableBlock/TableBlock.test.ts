import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import TableBlock, { type Props } from './TableBlock.astro';

describe('TableBlock', () => {
  test('Component is rendered', async () => {
    const fragment = await renderToFragment<Props>(TableBlock, {
      props: {
        block: {
          _modelApiKey: 'table_block',
          id: '123',
          title: 'Table Block',
          table: {
            columns: ['test_1', 'test_2'],
            data: [
              { test_1: 'Test 1', test_2: 'Test 2' }
            ]
          },
          hasHeaderRow: true,
          hasHeaderColumn: true
        }
      }
    });

    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
