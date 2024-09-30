import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import Icon from './Icon.astro';

const fragment = await renderToFragment(Icon);

describe('Icon', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
