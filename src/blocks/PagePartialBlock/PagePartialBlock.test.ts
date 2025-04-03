import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import PagePartialBlock, { type Props as PagePartialBlockProps } from './PagePartialBlock.astro';
import GroupingBlock, { type Props as GroupingBlockProps } from '../GroupingBlock/GroupingBlock.astro';
import { items } from '../GroupingBlock/GroupingBlock.test';

const layouts = [
  'stack-untitled',
  'stack-titled',
  'accordion-closed',
  'accordion-open',
  'tabs',
];

describe('PagePartialBlock', () => {
  layouts.forEach((layout) => {
    test(`renders same output as GroupingBlock for ${layout}`, async () => {
      const pagePartialBlock = await renderToFragment<PagePartialBlockProps>(PagePartialBlock, {
        props: {
          block: {
            __typename: 'PagePartialBlockRecord',
            id: 'ay-D0Z1ZTqWVszeV9ZqfJA',
            layout,
            items: items.map(({ __typename, ...item }) => item), // Remove __typename since it is not part of the PagePartialBlock definition
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
