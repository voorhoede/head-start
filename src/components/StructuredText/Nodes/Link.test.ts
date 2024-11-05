import { describe, expect, test } from 'vitest';
import { renderToFragment } from '@lib/renderer';
import Link, { type Props as LinkProps } from './Link.astro';

describe('Link', () => {
  const props = {
    node: {
      url: 'https://example.com',
      meta: undefined,
      type: 'link',
      children: [],
    },
  } satisfies LinkProps;

  test('renders text content without trailing whitespace ', async () => {
    const fragment = await renderToFragment<LinkProps>(Link, {
      props,
      slots: {
        default: 'spacing\n',
      },
    });
    expect(fragment.querySelector('a')?.textContent).toBe('spacing');
  });
});
