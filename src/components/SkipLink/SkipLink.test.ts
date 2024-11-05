import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import SkipLink from './SkipLink.astro';

const fragment = await renderToFragment(SkipLink);

describe('SkipLink', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
