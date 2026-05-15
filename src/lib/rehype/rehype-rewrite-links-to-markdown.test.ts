import { describe, expect, test } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeRewriteLinksToMarkdown from './rehype-rewrite-links-to-markdown';

const SITE = 'https://example.com';

async function rewrite(html: string, siteUrl = SITE): Promise<string> {
  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRewriteLinksToMarkdown, { siteUrl })
    .use(rehypeStringify)
    .process(html);
  return String(result);
}

describe('rehypeRewriteLinksToMarkdown', () => {
  test('rewrites relative path to markdown api route', async () => {
    const out = await rewrite('<a href="/en/about/">About</a>');
    expect(out).toContain(`href="${SITE}/api/content/en/about.md"`);
  });

  test('rewrites absolute same-origin URL', async () => {
    const out = await rewrite(`<a href="${SITE}/en/about/">About</a>`);
    expect(out).toContain(`href="${SITE}/api/content/en/about.md"`);
  });

  test('preserves query and hash', async () => {
    const out = await rewrite('<a href="/en/page/?x=1#section">Link</a>');
    expect(out).toContain(`href="${SITE}/api/content/en/page.md?x=1#section"`);
  });

  test('skips external links', async () => {
    const out = await rewrite('<a href="https://other.com/page/">External</a>');
    expect(out).toContain('href="https://other.com/page/"');
  });

  test('skips mailto and tel', async () => {
    const out = await rewrite('<a href="mailto:a@b.c">Mail</a><a href="tel:123">Tel</a>');
    expect(out).toContain('href="mailto:a@b.c"');
    expect(out).toContain('href="tel:123"');
  });

  test('skips protocol-relative URLs', async () => {
    const out = await rewrite('<a href="//other.com/x">X</a>');
    expect(out).toContain('href="//other.com/x"');
  });

  test('skips api routes', async () => {
    const out = await rewrite('<a href="/api/search/?q=foo">Search</a>');
    expect(out).toContain('href="/api/search/?q=foo"');
  });

  test('handles hash-only links', async () => {
    const out = await rewrite('<a href="#section">Anchor</a>');
    expect(out).toContain('href="#section"');
  });
});
