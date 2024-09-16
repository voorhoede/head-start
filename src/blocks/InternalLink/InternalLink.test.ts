import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import InternalLink, { type Props } from './InternalLink.astro';

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

describe('InternalLink', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
