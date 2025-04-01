import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import GroupingBlock, { type Props } from './GroupingBlock.astro';

const TEXT_BLOCK_RECORD = 'TextBlockRecord' as const;
const GROUPING_ITEM_RECORD = 'GroupingItemRecord' as const;

export const items = [
  {
    __typename: GROUPING_ITEM_RECORD,
    title: 'Partial A',
    blocks: [{
      __typename: TEXT_BLOCK_RECORD,
      text: {
        blocks: [],
        links: [],
        value: {
          schema: 'dast',
          document: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'span',
                    value: 'This is a test',
                  },
                ],
              },
            ],
          },
        },
      },
    }],
  },
];

describe('GroupingBlock', () => {
  test('renders a stack layout without a title when layout is "stack-untitled"', async () => {
    const fragment = await renderToFragment<Props>(GroupingBlock, {
      props: {
        block: {
          __typename: 'GroupingBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'stack-untitled',
          items,
        },
      },
    });

    expect(fragment.querySelector('h2')).toBeFalsy();
    expect(fragment.querySelector('p')).toBeTruthy();
    expect(fragment.querySelector('p')?.textContent).toBe('This is a test');
  });

  test('renders a stack layout with a title when layout is "stack-titled"', async () => {
    const fragment = await renderToFragment<Props>(GroupingBlock, {
      props: {
        block: {
          __typename: 'GroupingBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'stack-titled',
          items,
        },
      },
    });

    expect(fragment.querySelector('h2')).toBeTruthy();
    expect(fragment.querySelector('h2')?.textContent).toBe('Partial A');
    expect(fragment.querySelector('p')).toBeTruthy();
    expect(fragment.querySelector('p')?.textContent).toBe('This is a test');
  });

  test('renders a closed accordion layout when layout is "accordion-closed"', async () => {
    const fragment = await renderToFragment<Props>(GroupingBlock, {
      props: {
        block: {
          __typename: 'GroupingBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'accordion-closed',
          items,
        },
      },
    });

    expect(fragment.querySelector('details')).toBeTruthy();
    expect(fragment.querySelector('details[open]')).toBeFalsy();
  });

  test('renders an open accordion layout when layout is "accordion-open"', async () => {
    const fragment = await renderToFragment<Props>(GroupingBlock, {
      props: {
        block: {
          __typename: 'GroupingBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'accordion-open',
          items,
        },
      },
    });

    expect(fragment.querySelector('details[open]')).toBeTruthy();
  });

  test('renders a tabs layout with the correct structure and content when layout is "tabs"', async () => {
    const fragment = await renderToFragment<Props>(GroupingBlock, {
      props: {
        block: {
          __typename: 'GroupingBlockRecord',
          id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
          layout: 'tabs',
          items,
        },
      },
    });

    expect(fragment.querySelector('tabs-component')).toBeTruthy();
    expect(
      fragment.querySelector('tabs-tab[role="heading"]')?.textContent,
    ).toContain('Partial A');
    expect(
      fragment.querySelector('tabs-panel[role="region"] p')?.textContent,
    ).toContain('This is a test');
  });
});
