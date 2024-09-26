import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import InternalLink, { type Props } from './InternalLink.astro';

describe('InternalLink', () => {
  test('renders an anchor element with the correct href and text when provided with valid link and page properties', async () => {
    const fragment = await renderToFragment<Props>(InternalLink, {
      params: { locale: 'en' },
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
    expect(fragment.querySelector('a')?.href).toBe('/en/');
    expect(fragment.querySelector('a')?.textContent).toBe('A test link');
  });
});
