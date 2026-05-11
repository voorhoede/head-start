import { describe, expect, test } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import rehypeExtractMeta from './rehype-extract-meta';
import type { PageMeta } from './rehype-extract-meta';

async function getMeta(html: string): Promise<PageMeta> {
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeExtractMeta)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);
  return (result.data.meta ?? {}) as PageMeta;
}

describe('rehypeExtractMeta', () => {
  test('extracts og: meta properties', async () => {
    const html = `
      <html><head>
        <meta property="og:title" content="OG Title">
        <meta property="og:description" content="OG Description">
        <meta property="og:image" content="https://example.com/img.png">
      </head><body></body></html>
    `;
    const meta = await getMeta(html);
    expect(meta['og:title']).toBe('OG Title');
    expect(meta['og:description']).toBe('OG Description');
    expect(meta['og:image']).toBe('https://example.com/img.png');
  });

  test('extracts twitter: meta properties', async () => {
    const html = `
      <html><head>
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Twitter Title">
      </head><body></body></html>
    `;
    const meta = await getMeta(html);
    expect(meta['twitter:card']).toBe('summary_large_image');
    expect(meta['twitter:title']).toBe('Twitter Title');
  });

  test('extracts article: meta properties', async () => {
    const html = `
      <html><head>
        <meta property="article:author" content="Jane Doe">
        <meta property="article:published_time" content="2024-01-01">
      </head><body></body></html>
    `;
    const meta = await getMeta(html);
    expect(meta['article:author']).toBe('Jane Doe');
    expect(meta['article:published_time']).toBe('2024-01-01');
  });

  test('ignores non-relevant meta tags', async () => {
    const html = `
      <html><head>
        <meta name="viewport" content="width=device-width">
        <meta name="theme-color" content="#ffffff">
        <meta name="og:title" content="should be ignored because name not property">
      </head><body></body></html>
    `;
    const meta = await getMeta(html);
    expect(Object.keys(meta)).not.toContain('viewport');
    expect(Object.keys(meta)).not.toContain('theme-color');
  });

  test('returns empty object when no relevant meta tags are present', async () => {
    const html = '<html><head></head><body></body></html>';
    const meta = await getMeta(html);
    expect(meta).toEqual({});
  });
});
