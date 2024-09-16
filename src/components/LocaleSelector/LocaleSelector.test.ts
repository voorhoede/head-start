import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import LocaleSelector from './LocaleSelector.astro';

const fragment = await renderToFragment(LocaleSelector, {
  props: {
    pageUrls: []
  }
});

describe('LocaleSelector', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
