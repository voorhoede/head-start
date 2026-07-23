import { renderToFragment } from '~/lib/renderer';
import { describe, expect, test } from 'vitest';
import Columns, { type Props } from './Columns.astro';

describe('Columns', () => {
  test('renders a grid container with the correct CSS custom property for 2 columns', async () => {
    const fragment = await renderToFragment<Props>(Columns, {
      props: { count: 2 },
    });
    const el = fragment.querySelector('.columns') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.getAttribute('style')).toContain('--column-count:2');
  });

  test('renders a grid container with the correct CSS custom property for 3 columns', async () => {
    const fragment = await renderToFragment<Props>(Columns, {
      props: { count: 3 },
    });
    const el = fragment.querySelector('.columns') as HTMLElement;
    expect(el.getAttribute('style')).toContain('--column-count:3');
  });

  test('renders a grid container with the correct CSS custom property for 4 columns', async () => {
    const fragment = await renderToFragment<Props>(Columns, {
      props: { count: 4 },
    });
    const el = fragment.querySelector('.columns') as HTMLElement;
    expect(el.getAttribute('style')).toContain('--column-count:4');
  });
});
