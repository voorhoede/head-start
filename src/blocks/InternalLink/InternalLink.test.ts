import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import InternalLink, { type Props } from './InternalLink.astro';



describe('InternalLink', () => {
  test('Block has all props', async () => {
    const fragment = await renderToFragment<Props>(InternalLink, {
      props: {
        link: {
          title: 'A test link',
          page: {
            __typename: 'HomePageRecord',
            title: 'A test page',
          }
        }
      }
    });

    expect(fragment.querySelector('a')).toBeTruthy();
  });
});
