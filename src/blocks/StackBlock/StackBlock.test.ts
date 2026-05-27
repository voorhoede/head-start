import { renderToFragment } from '~/lib/renderer';
import { describe, expect, test } from 'vitest';
import StackBlock, { type Props } from './StackBlock.astro';

const TEXT_BLOCK_RECORD = 'TextBlockRecord' as const;
const STACK_ITEM_RECORD = 'StackItemRecord' as const;

const items = [
  {
    __typename: STACK_ITEM_RECORD,
    title: 'Section A',
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
                children: [{ type: 'span', value: 'This is a test' }],
              },
            ],
          },
        },
      },
    }],
  },
];

describe('StackBlock', () => {
  test('renders without a title when isTitled is false', async () => {
    const fragment = await renderToFragment<Props>(StackBlock, {
      props: {
        block: {
          __typename: 'StackBlockRecord',
          id: 'stack-test-1',
          isTitled: false,
          items,
        },
      },
    });

    expect(fragment.querySelector('h2')).toBeFalsy();
    expect(fragment.querySelector('p')?.textContent).toBe('This is a test');
  });

  test('renders with a title heading when isTitled is true', async () => {
    const fragment = await renderToFragment<Props>(StackBlock, {
      props: {
        block: {
          __typename: 'StackBlockRecord',
          id: 'stack-test-2',
          isTitled: true,
          items,
        },
      },
    });

    expect(fragment.querySelector('h2')).toBeTruthy();
    expect(fragment.querySelector('h2')?.textContent).toBe('Section A');
    expect(fragment.querySelector('p')?.textContent).toBe('This is a test');
  });

  test('renders without a title even when isTitled is true if title is empty', async () => {
    const fragment = await renderToFragment<Props>(StackBlock, {
      props: {
        block: {
          __typename: 'StackBlockRecord',
          id: 'stack-test-3',
          isTitled: true,
          items: [{ ...items[0], title: null }],
        },
      },
    });

    expect(fragment.querySelector('h2')).toBeFalsy();
  });
});
