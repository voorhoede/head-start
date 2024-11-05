import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import Tabs from './Tabs.astro';

const fragment = await renderToFragment(Tabs);

describe('Tabs', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
