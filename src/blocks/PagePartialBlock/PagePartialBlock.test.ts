import { renderToFragment } from '@lib/renderer';
import { describe, expect, test, vi } from 'vitest';
import PagePartialBlock, { type Props as PagePartialBlockProps } from './PagePartialBlock.astro';
import GroupingBlock, { type Props as GroupingBlockProps } from '../GroupingBlock/GroupingBlock.astro';
import { items } from '../GroupingBlock/GroupingBlock.test';

const layouts = [
  'stack-untitled',
  'stack-titled',
  'accordion-closed',
  'accordion-open',
  'tabs',
] as const;

vi.mock('astro:content', () => ({
  // fetch content from grouping block tests via mocked getEntry
  getEntry: (_: string, id: string, __: string) => {
    const index = Number(id.split('index-').pop()) || 0;
    return { 
      id,
      data: items[index],
    };
  },
}));

describe('PagePartialBlock', () => {
  layouts.forEach((layout) => {
    test(`renders same output as GroupingBlock for ${layout}`, async () => {
      const pagePartialBlock = await renderToFragment<PagePartialBlockProps>(PagePartialBlock, {
        props: {
          block: {
            __typename: 'PagePartialBlockRecord',
            id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
            items: items.map((_, i) => ({ id: `index-${i}` })),
            layout,
          }
        }
      });

      const groupingBlock = await renderToFragment<GroupingBlockProps>(GroupingBlock, {
        props: {
          block: {
            __typename: 'GroupingBlockRecord',
            id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
            layout,
            items,
          }
        }
      });
      
      expect(pagePartialBlock).toEqual(groupingBlock);
      expect(pagePartialBlock.querySelector('p')).toBeTruthy();
    });
  });
});
