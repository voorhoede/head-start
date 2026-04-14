import { beforeEach, describe, expect, test } from 'vitest';
import { htmlIdSlug, resetHtmlIdSlugger } from './index';

beforeEach(() => {
  resetHtmlIdSlugger();
});

describe('htmlIdSlug', () => {
  test('generates a slug from the html text content when no id is given', () => {
    const slug = htmlIdSlug({ html: '<h2>Hello World</h2>' });
    expect(slug).toBe('hello-world');
  });

  test('uses the given id directly as the slug', () => {
    const slug = htmlIdSlug({ id: 'My Custom ID', html: '<h2>ignored</h2>' });
    expect(slug).toBe('my-custom-id');
  });

  test('deduplicates slugs by appending a counter for repeated text', () => {
    const first = htmlIdSlug({ html: '<h2>Section</h2>' });
    const second = htmlIdSlug({ html: '<h2>Section</h2>' });
    expect(first).toBe('section');
    expect(second).toBe('section-1');
  });

  test('deduplicates slugs by appending a counter for repeated ids', () => {
    const first = htmlIdSlug({ id: 'intro', html: '' });
    const second = htmlIdSlug({ id: 'intro', html: '' });
    expect(first).toBe('intro');
    expect(second).toBe('intro-1');
  });
});

describe('resetHtmlIdSlugger', () => {
  test('resets duplicate counter so the same slug can be reused', () => {
    const first = htmlIdSlug({ html: '<h2>Section</h2>' });
    expect(first).toBe('section');

    resetHtmlIdSlugger();

    const afterReset = htmlIdSlug({ html: '<h2>Section</h2>' });
    expect(afterReset).toBe('section');
  });
});
