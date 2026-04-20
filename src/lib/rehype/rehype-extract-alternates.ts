import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { selectAll } from 'hast-util-select';
import type { Alternate } from '~/lib/frontmatter';

const rehypeExtractAlternates: Plugin<[], Root> = () => (tree, file) => {
  const alternates: Alternate[] = [];
  const altLinks = selectAll('link[rel="alternate"][hreflang]', tree);
  for (const link of altLinks) {
    const locale = typeof link.properties?.hreflang === 'string' ? link.properties.hreflang : '';
    const href = typeof link.properties?.href === 'string' ? link.properties.href : '';
    if (locale && href) {
      alternates.push({ locale, url: href });
    }
  }
  file.data.alternates = alternates;
};

export default rehypeExtractAlternates;
