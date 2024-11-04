import { describe, expect, test } from 'vitest';
import { renderToFragment } from '@lib/renderer';
import type { InternalLinkFragment } from '@lib/types/datocms';
import InternalLink, { type Props as InternalLinkProps } from './InternalLink.astro';

const link = {
  title: 'Homepage',
  page: {
    __typename: 'HomePageRecord',
    title: 'Homepage',
  },
} satisfies InternalLinkFragment;

const props = { 
  link
} satisfies InternalLinkProps;
describe('InternalLink', () => {
  test('Component is rendered', async () => {
    const fragment = await renderToFragment<InternalLinkProps>(
      InternalLink,
      { props }
    );
    expect(fragment).toBeDefined();
  });
});
