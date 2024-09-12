import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import StructuredText from './StructuredText.astro';

const fragment = await renderToFragment(StructuredText);

describe('StructuredText', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});