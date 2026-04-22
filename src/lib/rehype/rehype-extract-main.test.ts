import { describe, expect, test } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import rehypeExtractMain from './rehype-extract-main';

async function extractMain(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeExtractMain)
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .process(html);
  return String(result).trim();
}

describe('rehypeExtractMain', () => {
  test('extracts content from <main> and excludes nav and footer', async () => {
    const html = `
      <html><body>
        <nav>Navigation</nav>
        <main><h1>Title</h1><p>Content</p></main>
        <footer>Footer</footer>
      </body></html>
    `;
    const md = await extractMain(html);
    expect(md).toContain('Title');
    expect(md).toContain('Content');
    expect(md).not.toContain('Navigation');
    expect(md).not.toContain('Footer');
  });

  test('returns empty output when no <main> element is present', async () => {
    const html = '<html><body><p>No main element</p></body></html>';
    const md = await extractMain(html);
    expect(md).toBe('');
  });

  test('handles nested elements inside <main>', async () => {
    const html = `
      <html><body>
        <main>
          <h2>Section</h2>
          <ul><li>Item 1</li><li>Item 2</li></ul>
        </main>
      </body></html>
    `;
    const md = await extractMain(html);
    expect(md).toContain('Section');
    expect(md).toContain('Item 1');
    expect(md).toContain('Item 2');
  });
});
