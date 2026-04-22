import { describe, expect, test } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import rehypeExtractNoindex from './rehype-extract-noindex';

async function getNoindex(html: string): Promise<boolean> {
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeExtractNoindex)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);
  return Boolean(result.data.noindex);
}

describe('rehypeExtractNoindex', () => {
  test('returns true for content="noindex"', async () => {
    const html = '<html><head><meta name="robots" content="noindex"></head><body></body></html>';
    expect(await getNoindex(html)).toBe(true);
  });

  test('returns true for uppercase NOINDEX (case-insensitive)', async () => {
    const html = '<html><head><meta name="robots" content="NOINDEX"></head><body></body></html>';
    expect(await getNoindex(html)).toBe(true);
  });

  test('returns true for comma-separated directives containing noindex', async () => {
    const html = '<html><head><meta name="robots" content="noindex, nofollow"></head><body></body></html>';
    expect(await getNoindex(html)).toBe(true);
  });

  test('returns false when robots meta has no noindex directive', async () => {
    const html = '<html><head><meta name="robots" content="nofollow"></head><body></body></html>';
    expect(await getNoindex(html)).toBe(false);
  });

  test('returns false when there is no robots meta tag', async () => {
    const html = '<html><head></head><body></body></html>';
    expect(await getNoindex(html)).toBe(false);
  });

  test('returns false when robots meta content is empty', async () => {
    const html = '<html><head><meta name="robots" content=""></head><body></body></html>';
    expect(await getNoindex(html)).toBe(false);
  });
});
