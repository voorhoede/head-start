import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import HeadingBlock, { type Props } from './HeadingBlock.astro';

describe('HeadingBlock', () => {
  test('renders a heading with the proper data', async () => {
    const fragment = await renderToFragment<Props>(HeadingBlock, {
      props: {
        block: {
          id: '123',
          heading: 'test',
        }
      }
    });

    expect(fragment.querySelector('h2')).toBeTruthy();
    expect(fragment.querySelector('h2')?.textContent).toBe('test');
  });

  test('renders a heading level 3 when that level is provided', async () => {
    const fragment = await renderToFragment<Props>(HeadingBlock, {
      props: {
        block: {
          id: '123',
          heading: 'test',
          level: 3,
        }
      }
    });

    expect(fragment.querySelector('h3')).toBeTruthy();
    expect(fragment.querySelector('h3')?.textContent).toBe('test');
  });

  test('renders a subheading', async () => {
    const fragment = await renderToFragment<Props>(HeadingBlock, {
      props: {
        block: {
          id: '123',
          heading: 'test',
          subHeading: 'subheading'
        }
      }
    });

    expect(fragment.querySelector('h2 small')).toBeTruthy();
    expect(fragment.querySelector('h2 small')?.textContent).toBe('subheading');
  });
});
