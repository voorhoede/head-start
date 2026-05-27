import { renderToFragment } from '~/lib/renderer';
import { describe, expect, test } from 'vitest';
import ColumnBlock, { type Props } from './ColumnBlock.astro';

const TEXT_BLOCK_RECORD = 'TextBlockRecord' as const;
const COLUMN_ITEM_RECORD = 'ColumnItemRecord' as const;

const makeTextItem = (text: string) => ({
  __typename: COLUMN_ITEM_RECORD,
  blocks: [{
    __typename: TEXT_BLOCK_RECORD,
    text: {
      blocks: [],
      inlineBlocks: [],
      links: [],
      value: {
        schema: 'dast',
        document: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'span', value: text }],
            },
          ],
        },
      },
    },
  }],
});

describe('ColumnBlock', () => {
  test('renders the correct column count CSS custom property', async () => {
    const fragment = await renderToFragment<Props>(ColumnBlock, {
      props: {
        block: {
          __typename: 'ColumnBlockRecord',
          id: 'col-test-1',
          numberOfColumns: 3,
          items: [makeTextItem('Col 1'), makeTextItem('Col 2'), makeTextItem('Col 3')],
        },
      },
    });

    const columns = fragment.querySelector('.columns') as HTMLElement;
    expect(columns).toBeTruthy();
    expect(columns.getAttribute('style')).toContain('--column-count:3');
  });

  test('renders each item inside a column wrapper', async () => {
    const fragment = await renderToFragment<Props>(ColumnBlock, {
      props: {
        block: {
          __typename: 'ColumnBlockRecord',
          id: 'col-test-2',
          numberOfColumns: 2,
          items: [makeTextItem('Col A'), makeTextItem('Col B')],
        },
      },
    });

    const columnDivs = fragment.querySelectorAll('.column');
    expect(columnDivs.length).toBe(2);
  });
});
