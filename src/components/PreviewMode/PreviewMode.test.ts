import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import PreviewMode from './PreviewMode.astro';

const fragment = await renderToFragment(PreviewMode);

describe('PreviewMode', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
