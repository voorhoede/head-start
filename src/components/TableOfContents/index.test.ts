import { describe, expect, test } from 'vitest';
import { processTableOfContents } from './index';

describe('processTableOfContents', () => {
  test('returns an empty list when there are no headings', () => {
    const { items } = processTableOfContents('<p>No headings here</p>');
    expect(items).toEqual([]);
  });

  test('assigns slug ids to headings that have none', () => {
    const { items, html } = processTableOfContents('<h2>Hello World</h2>');
    expect(items).toEqual([{ id: 'hello-world', level: 2, text: 'Hello World' }]);
    expect(html).toContain('id="hello-world"');
  });

  test('slugs author-set ids and keeps them on the element', () => {
    const { items, html } = processTableOfContents('<h2 id="My Custom ID">Title</h2>');
    expect(items[0].id).toBe('my-custom-id');
    expect(html).toContain('id="my-custom-id"');
  });

  test('deduplicates repeated headings with a counter suffix', () => {
    const { items } = processTableOfContents('<h2>Section</h2><h2>Section</h2>');
    expect(items.map((item) => item.id)).toEqual(['section', 'section-1']);
  });

  test('extracts a flat list of sibling headings', () => {
    const { items } = processTableOfContents(`
      <h2>First</h2>
      <h2>Second</h2>
    `);
    expect(items).toEqual([
      { id: 'first', level: 2, text: 'First' },
      { id: 'second', level: 2, text: 'Second' },
    ]);
  });

  test('nests a deeper heading under the previous shallower heading', () => {
    const { items } = processTableOfContents(`
      <h2>Parent</h2>
      <h3>Child</h3>
    `);
    expect(items).toEqual([
      {
        id: 'parent',
        level: 2,
        text: 'Parent',
        items: [{ id: 'child', level: 3, text: 'Child' }],
      },
    ]);
  });

  test('does not nest when heading level goes back to same or higher level', () => {
    const { items } = processTableOfContents(`
      <h2>First</h2>
      <h3>Sub</h3>
      <h2>Second</h2>
    `);
    expect(items).toHaveLength(2);
    expect(items[0].items).toHaveLength(1);
    expect(items[1].items).toBeUndefined();
  });

  test('uses the text content of the heading', () => {
    const { items } = processTableOfContents('<h2><span>Nested <strong>text</strong></span></h2>');
    expect(items[0].text).toBe('Nested text');
  });

  test('nests items more than one level deep', () => {
    const { items } = processTableOfContents(`
      <h2>Parent</h2>
      <h3>Child</h3>
      <h4>Grandchild</h4>
    `);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('parent');
    expect(items[0].items).toHaveLength(1);
    expect(items[0].items![0].id).toBe('child');
    expect(items[0].items![0].items).toHaveLength(1);
    expect(items[0].items![0].items![0].id).toBe('grandchild');
  });

  test('handles all heading levels h1–h6', () => {
    const html = [1, 2, 3, 4, 5, 6]
      .map((n) => `<h${n}>Heading ${n}</h${n}>`)
      .join('');
    const { items } = processTableOfContents(html);
    expect(items[0]).toMatchObject({ id: 'heading-1', level: 1 });
  });
});
