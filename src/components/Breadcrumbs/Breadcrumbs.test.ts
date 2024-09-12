import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import type { Breadcrumb } from './index';
import Breadcrumbs from './Breadcrumbs.astro';

const fragment = await renderToFragment<{ items: Breadcrumb[] }>(Breadcrumbs, {
  props: {
    items: [
      { text: 'Home' }
    ]
  }
});

describe('Breadcrumbs', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
