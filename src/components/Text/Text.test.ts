import { renderToFragment } from '~/lib/renderer';
import { describe, expect, test } from 'vitest';
import StructuredText from './Text.astro';

const fragment = await renderToFragment(StructuredText);

describe('StructuredText', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
