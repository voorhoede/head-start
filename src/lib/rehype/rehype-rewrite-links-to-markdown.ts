import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { selectAll } from 'hast-util-select';
import { htmlToMarkdownPath } from '~/lib/routing/markdown';

export interface Options {
  siteUrl: string;
}

// Same-origin paths that are not content pages and have no markdown
// alternative: the markdown API itself and the proxied file assets.
const NON_CONTENT_PREFIXES = ['/api/', '/files/'];

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

      if (NON_CONTENT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        continue;
      }

      node.properties!.href = `${origin}${htmlToMarkdownPath(pathname)}`;
    }
  };
};

export default rehypeRewriteLinksToMarkdown;
