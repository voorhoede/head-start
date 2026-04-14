import { describe, expect, test } from 'vitest';
import { extractTocItemsFromHtml } from './index';

describe('extractTocItemsFromHtml', () => {
  test('returns an empty array when there are no headings', () => {
    const items = extractTocItemsFromHtml('<p>No headings here</p>');
    expect(items).toEqual([]);
  });

  test('returns an empty array when headings have no id attribute', () => {
    const items = extractTocItemsFromHtml('<h2>No id</h2><h3>Also no id</h3>');
    expect(items).toEqual([]);
  });

  test('extracts a flat list of headings with ids', () => {
    const items = extractTocItemsFromHtml(`
      <h2 id="first">First</h2>
      <h2 id="second">Second</h2>
    `);
    expect(items).toEqual([
      { id: 'first', level: 2, text: 'First' },
      { id: 'second', level: 2, text: 'Second' },
    ]);
  });

  test('nests a deeper heading under the previous shallower heading', () => {
    const items = extractTocItemsFromHtml(`
      <h2 id="parent">Parent</h2>
      <h3 id="child">Child</h3>
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
    const items = extractTocItemsFromHtml(`
      <h2 id="first">First</h2>
      <h3 id="sub">Sub</h3>
      <h2 id="second">Second</h2>
    `);
    expect(items).toHaveLength(2);
    expect(items[0].items).toHaveLength(1);
    expect(items[1].items).toBeUndefined();
  });

  test('uses the text content of the heading', () => {
    const items = extractTocItemsFromHtml('<h2 id="my-heading"><span>Nested <strong>text</strong></span></h2>');
    expect(items[0].text).toBe('Nested text');
  });

  test('nests items more than one level deep (ol > li > ol > li > ol > li)', () => {
    const items = extractTocItemsFromHtml(`
      <h2 id="parent">Parent</h2>
      <h3 id="child">Child</h3>
      <h4 id="grandchild">Grandchild</h4>
    `);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('parent');
    expect(items[0].items).toHaveLength(1);
    expect(items[0].items![0].id).toBe('child');
    expect(items[0].items![0].items).toHaveLength(1);
    expect(items[0].items![0].items![0].id).toBe('grandchild');
  });

  test('extracts all heading levels h1–h6', () => {
    const html = [1, 2, 3, 4, 5, 6]
      .map((n) => `<h${n} id="h${n}">Heading ${n}</h${n}>`)
      .join('');
    const items = extractTocItemsFromHtml(html);
    // h1 is always top-level; deeper ones nest under the previous item
    expect(items[0]).toMatchObject({ id: 'h1', level: 1 });
  });
});
