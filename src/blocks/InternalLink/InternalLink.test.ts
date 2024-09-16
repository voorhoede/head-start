import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import InternalLink, { type Props } from './InternalLink.astro';



describe('InternalLink', () => {
  test('Component is rendered', async () => {
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

    expect(fragment).toBeTruthy();
  });
});
