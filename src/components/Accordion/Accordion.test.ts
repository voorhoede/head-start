import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import Accordion from './Accordion.astro';

const fragment = await renderToFragment(Accordion);

describe('Accordion', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});