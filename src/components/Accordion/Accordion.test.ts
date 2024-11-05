import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import Accordion from './Accordion.astro';

describe('Accordion', () => {
  test('Component is rendered', async () => {
    const fragment = await renderToFragment(Accordion);
    expect(fragment.querySelector('section[role="group"]')).toBeTruthy();
  });
});
