import { describe, expect, test } from 'vitest';
import {
  htmlToMarkdownPath,
  isMarkdownApiPath,
  markdownToHtmlPath,
} from './markdown';

describe('htmlToMarkdownPath', () => {
  test('rewrites nested path', () => {
    expect(htmlToMarkdownPath('/en/about/')).toBe('/api/content/en/about.md');
  });

  test('rewrites root', () => {
    expect(htmlToMarkdownPath('/')).toBe('/api/content/.md');
  });

  test('preserves query and hash', () => {
    expect(htmlToMarkdownPath('/en/page/?x=1#section')).toBe(
      '/api/content/en/page.md?x=1#section',
    );
  });

  test('handles missing trailing slash', () => {
    expect(htmlToMarkdownPath('/en/about')).toBe('/api/content/en/about.md');
  });
});

describe('markdownToHtmlPath', () => {
  test('reverses nested path', () => {
    expect(markdownToHtmlPath('/api/content/en/about.md')).toBe('/en/about/');
  });

  test('reverses root', () => {
    expect(markdownToHtmlPath('/api/content/.md')).toBe('/');
  });

  test('preserves query and hash', () => {
    expect(markdownToHtmlPath('/api/content/en/page.md?x=1#section')).toBe(
      '/en/page/?x=1#section',
    );
  });

  test('passes non-markdown path through', () => {
    expect(markdownToHtmlPath('/en/about/')).toBe('/en/about/');
  });

  test('round-trips html → md → html', () => {
    const html = '/en/about/';
    expect(markdownToHtmlPath(htmlToMarkdownPath(html))).toBe(html);
  });
});

describe('isMarkdownApiPath', () => {
  test('detects markdown api path', () => {
    expect(isMarkdownApiPath('/api/content/en/about.md')).toBe(true);
  });

  test('rejects html path', () => {
    expect(isMarkdownApiPath('/en/about/')).toBe(false);
  });

  test('rejects other api path', () => {
    expect(isMarkdownApiPath('/api/search/?q=foo')).toBe(false);
  });
});
