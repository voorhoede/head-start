import { renderToFragment } from '~/lib/renderer';
import { describe, expect, test } from 'vitest';
import TabsBlock, { type Props } from './TabsBlock.astro';

const TEXT_BLOCK_RECORD = 'TextBlockRecord' as const;
const TABS_ITEM_RECORD = 'TabsItemRecord' as const;

const items = [
  {
    __typename: TABS_ITEM_RECORD,
    title: 'Tab A',
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

describe('TabsBlock', () => {
  test('renders a tabs layout with the correct structure and content', async () => {
    const fragment = await renderToFragment<Props>(TabsBlock, {
      props: {
        block: {
          __typename: 'TabsBlockRecord',
          id: 'tabs-test-1',
          items,
        },
      },
    });

    expect(fragment.querySelector('tabs-component')).toBeTruthy();
    expect(
      fragment.querySelector('tabs-tab[role="heading"]')?.textContent,
    ).toContain('Tab A');
    expect(
      fragment.querySelector('tabs-panel[role="region"] p')?.textContent,
    ).toContain('This is a test');
  });
});
