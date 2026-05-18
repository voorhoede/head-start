import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { selectAll } from 'hast-util-select';
import { htmlToMarkdownPath } from '~/lib/routing/markdown';

export interface Options {
  siteUrl: string;
}

const rehypeRewriteLinksToMarkdown: Plugin<[Options], Root> = ({ siteUrl }) => {
  const origin = new URL(siteUrl).origin;

  return (tree) => {
    for (const node of selectAll('a[href]', tree)) {
      const href = node.properties?.href;
      if (typeof href !== 'string' || href === '') continue;

      let pathname: string;
      if (href.startsWith('/') && !href.startsWith('//')) {
        pathname = href;
      } else if (href.startsWith(origin)) {
        pathname = href.slice(origin.length) || '/';
      } else {
        continue;
      }

      if (pathname.startsWith('/api/')) continue;

      node.properties!.href = `${origin}${htmlToMarkdownPath(pathname)}`;
    }
  };
};

export default rehypeRewriteLinksToMarkdown;
