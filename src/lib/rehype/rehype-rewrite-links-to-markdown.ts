import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { selectAll } from 'hast-util-select';

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

      const [pathQuery, hash = ''] = pathname.split('#');
      const [path, query = ''] = pathQuery.split('?');

      if (path.startsWith('/api/')) continue;

      const trimmed = path.replace(/^\/+|\/+$/g, '');
      const mdPath = trimmed ? `/api/content/${trimmed}.md` : '/api/content/.md';
      const suffix =
        (query ? `?${query}` : '') + (hash ? `#${hash}` : '');
      node.properties!.href = `${origin}${mdPath}${suffix}`;
    }
  };
};

export default rehypeRewriteLinksToMarkdown;
