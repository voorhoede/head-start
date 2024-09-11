import { renderToFragment } from '@lib/renderer';
import type { InternalLinkFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import InternalLink from './InternalLink.astro';

const fragment = await renderToFragment<{ link: InternalLinkFragment }>(InternalLink, {
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
});
