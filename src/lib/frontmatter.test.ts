import { describe, expect, test } from 'vitest';
import { buildFrontmatter, parseFrontmatter } from '~/lib/frontmatter';

describe('buildFrontmatter', () => {
  test('emits title from og:title', () => {
    const result = buildFrontmatter({ meta: { 'og:title': 'My Page' }, url: 'https://example.com/' });
    expect(result).toContain('title: "My Page"');
  });

  test('falls back to twitter:title when og:title is absent', () => {
    const result = buildFrontmatter({ meta: { 'twitter:title': 'Twitter Title' }, url: 'https://example.com/' });
    expect(result).toContain('title: "Twitter Title"');
  });

  test('falls back to dc.title when og:title and twitter:title are absent', () => {
    const result = buildFrontmatter({ meta: { 'dc.title': 'DC Title' }, url: 'https://example.com/' });
    expect(result).toContain('title: "DC Title"');
  });

  test('emits description from og:description', () => {
    const result = buildFrontmatter({ meta: { 'og:description': 'A description' }, url: 'https://example.com/' });
    expect(result).toContain('description: "A description"');
  });

  test('emits language when provided', () => {
    const result = buildFrontmatter({ meta: {}, url: 'https://example.com/', language: 'English' });
    expect(result).toContain('language: "English"');
  });

  test('omits language when not provided', () => {
    const result = buildFrontmatter({ meta: {}, url: 'https://example.com/' });
    expect(result).not.toContain('language');
  });

  test('uses og:url over provided url', () => {
    const result = buildFrontmatter({ meta: { 'og:url': 'https://canonical.com/' }, url: 'https://different.com/' });
    expect(result).toContain('url: "https://canonical.com/"');
    expect(result).not.toContain('https://different.com/');
  });

  test('falls back to provided url when og:url is absent', () => {
    const result = buildFrontmatter({ meta: {}, url: 'https://example.com/page/' });
    expect(result).toContain('url: "https://example.com/page/"');
  });

  test('does not include og:, twitter:, or article: keys directly', () => {
    const meta = {
      'og:title': 'Title',
      'og:image': 'https://example.com/img.png',
      'twitter:card': 'summary',
      'article:author': 'Author',
    };
    const result = buildFrontmatter({ meta, url: 'https://example.com/' });
    expect(result).not.toContain('og:');
    expect(result).not.toContain('twitter:');
    expect(result).not.toContain('article:');
  });

  test('returns empty string when meta is empty and url is empty', () => {
    expect(buildFrontmatter({ meta: {}, url: '' })).toBe('');
  });

  test('escapes double quotes in values', () => {
    const result = buildFrontmatter({ meta: { 'og:title': 'Say "hello"' }, url: 'https://example.com/' });
    expect(result).toContain('title: "Say \\"hello\\""');
  });

  test('escapes backslashes in values', () => {
    const result = buildFrontmatter({ meta: { 'og:title': 'C:\\\\path' }, url: 'https://example.com/' });
    expect(result).toContain('title: "C:\\\\\\\\path"');
  });

  test('wraps output in YAML front matter delimiters', () => {
    const result = buildFrontmatter({ meta: { 'og:title': 'Test' }, url: 'https://example.com/' });
    expect(result).toMatch(/^---\n/);
    expect(result).toMatch(/\n---\n\n$/);
  });
});

describe('parseFrontmatter', () => {
  test('returns an empty object when there is no front matter block', () => {
    expect(parseFrontmatter('# Just markdown\n')).toEqual({});
  });

  test('round-trips every field built by buildFrontmatter', () => {
    const built = buildFrontmatter({
      meta: { 'og:title': 'My Page', 'og:description': 'A description' },
      url: 'https://example.com/page/',
      language: 'English',
    });
    expect(parseFrontmatter(built)).toEqual({
      title: 'My Page',
      description: 'A description',
      language: 'English',
      url: 'https://example.com/page/',
    });
  });

  test('round-trips double quotes', () => {
    const built = buildFrontmatter({ meta: { 'og:title': 'Say "hello"' }, url: 'https://example.com/' });
    expect(parseFrontmatter(built).title).toBe('Say "hello"');
  });

  test('round-trips backslashes', () => {
    const built = buildFrontmatter({ meta: { 'og:title': 'C:\\path' }, url: 'https://example.com/' });
    expect(parseFrontmatter(built).title).toBe('C:\\path');
  });

  test('round-trips a literal backslash followed by n without turning it into a newline', () => {
    const built = buildFrontmatter({ meta: { 'og:title': 'literal \\n here' }, url: 'https://example.com/' });
    expect(parseFrontmatter(built).title).toBe('literal \\n here');
  });
});
