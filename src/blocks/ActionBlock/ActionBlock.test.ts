import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import InlineBlock, { type Props } from './ActionBlock.astro';
import type { ActionBlockFragment, InternalLinkFragment, SiteLocale } from '@lib/datocms/types';
import { locales } from '@lib/i18n';

const createInternalLinkFragment = (title: string, slug: string, style: string) => ({
  '__typename': 'InternalLinkRecord',
  'id': `${slug}-123`,
  'title': title,
  'style': style,
  'link': {
    '__typename': 'PageRecord',
    'id': `${slug}-456`,
    'title': title, // not neccessarily the same as title of the link record, but works for simplicity
    'slug': slug,   // not neccessarily the same as  slug of the link record, but works for simplicity
    '_allSlugLocales': locales.map(locale => ({ locale: locale as SiteLocale, value: slug })),
    'parentPage': null
  }
} satisfies InternalLinkFragment);

const createActionBlockFragment = (items: InternalLinkFragment[]) => ({
  '__typename': 'ActionBlockRecord',
  'id': 'PL9XQGyWQjuyHpdDNsXCNg',
  'items': items
} satisfies ActionBlockFragment);

describe('ActionBlock', () => {
  test('Block is rendered', async () => {
    const blockWithTwoItems = createActionBlockFragment([
      createInternalLinkFragment('First item', 'first-item', 'primary'),
      createInternalLinkFragment('Second item', 'second-item', 'secondary'),
    ]);
    const fragment = await renderToFragment<Props>(InlineBlock, {
      props: {
        block: blockWithTwoItems,
      }
    });

    expect(fragment.querySelectorAll('a.action').length).toBe(2);
    expect(fragment.querySelector('a.action--primary')?.textContent).toBe('First item');
    expect(fragment.querySelector('a.action--secondary')?.textContent).toBe('Second item');
  });

});
