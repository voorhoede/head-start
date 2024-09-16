import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import ShareButton from './ShareButton.astro';

const fragment = await renderToFragment(ShareButton);

describe('ShareButton', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
