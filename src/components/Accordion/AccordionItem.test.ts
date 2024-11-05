import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import AccordionItem, { type Props } from './AccordionItem.astro';

describe('Accordion Item', () => {
  test('Component is rendered', async () => {
    const fragment = await renderToFragment<Props>(AccordionItem, {
      slots: {
        heading: 'Heading',
        body: 'Body'
      },
      props: {
        name: 'test'
      }
    });

    expect(fragment.querySelector('details')).toBeTruthy();
    expect(fragment.querySelector('details')?.getAttribute('name')).toBe('test');
    expect(fragment.querySelector('details')?.textContent).toContain('Body');
    expect(fragment.querySelector('summary')?.textContent).toContain('Heading');
  });
});
