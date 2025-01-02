// adapted from https://www.datocms.com/docs/structured-text/migrating-content-to-structured-text#migrating-markdown-content
import { unified } from 'unified';
import { toHast } from 'mdast-util-to-hast';
import parse from 'remark-parse';
import { hastToStructuredText, type Options, type HastRootNode } from 'datocms-html-to-structured-text';
import { validate } from 'datocms-structured-text-utils';
import { visit } from 'unist-util-visit';

export async function markdownToStructuredText(
  markdown: string,
  options: Options,
) {
  if (!markdown) {
    return null;
  }
  const mdastTree = unified().use(parse).parse(markdown);
  visit(mdastTree, 'link', (node) => {
    if (node.url.startsWith('./') && node.url.includes('.md')) {
      node.url = node.url
        .replace('./', '../')
        .replace('.md', '/');
    } else if (node.url.startsWith('../')) {
      node.url = node.url.replace('../', 'https://github.com/voorhoede/head-start/tree/main/');
    }
  });
  const hastTree = toHast(mdastTree) as HastRootNode;
  const result = await hastToStructuredText(hastTree, options);
  const validationResult = validate(result);
  if (!validationResult.valid) {
    throw new Error(validationResult.message);
  }
  return result;
}
