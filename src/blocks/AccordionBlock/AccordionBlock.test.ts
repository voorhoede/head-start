import { renderToFragment } from '~/lib/renderer';
import { describe, expect, test } from 'vitest';
import AccordionBlock, { type Props } from './AccordionBlock.astro';

const TEXT_BLOCK_RECORD = 'TextBlockRecord' as const;
const ACCORDION_ITEM_RECORD = 'AccordionItemRecord' as const;

const items = [
  {
    __typename: ACCORDION_ITEM_RECORD,
    title: 'Item A',
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
  {
    __typename: ACCORDION_ITEM_RECORD,
    title: 'Item B',
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
                children: [{ type: 'span', value: 'Second item' }],
              },
            ],
          },
        },
      },
    }],
  },
];

describe('AccordionBlock', () => {
  test('renders a closed accordion when isFirstItemOpenOnStart is false', async () => {
    const fragment = await renderToFragment<Props>(AccordionBlock, {
      props: {
        block: {
          __typename: 'AccordionBlockRecord',
          id: 'acc-test-1',
          isFirstItemOpenOnStart: false,
          items,
        },
      },
    });

    expect(fragment.querySelector('details')).toBeTruthy();
    expect(fragment.querySelector('details[open]')).toBeFalsy();
  });

  test('renders only the first item open when isFirstItemOpenOnStart is true', async () => {
    const fragment = await renderToFragment<Props>(AccordionBlock, {
      props: {
        block: {
          __typename: 'AccordionBlockRecord',
          id: 'acc-test-2',
          isFirstItemOpenOnStart: true,
          items,
        },
      },
    });

    const allDetails = fragment.querySelectorAll('details');
    expect(allDetails.length).toBe(2);
    expect(allDetails[0].hasAttribute('open')).toBe(true);
    expect(allDetails[1].hasAttribute('open')).toBe(false);
  });
});
