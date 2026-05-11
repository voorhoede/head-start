import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { selectAll } from 'hast-util-select';

export type PageMeta = Record<string, string>;

const relevantPrefixes = ['og:', 'article:', 'twitter:'];
const relevantNames = ['dc.title', 'dc.description'];

const isRelevantKey = (key: string): boolean =>
  relevantPrefixes.some((prefix) => key.startsWith(prefix)) ||
  relevantNames.includes(key);

const rehypeExtractMeta: Plugin<[], Root> = () => (tree, file) => {
  const meta: PageMeta = {};
  const metaTags = selectAll('meta[property], meta[name]', tree);

  for (const tag of metaTags) {
    const property = tag.properties?.property;
    const name = tag.properties?.name;
    const content = tag.properties?.content;

    const key =
      typeof property === 'string'
        ? property
        : typeof name === 'string'
          ? name
          : '';
    const value = typeof content === 'string' ? content : '';

    if (key && value && isRelevantKey(key)) {
      meta[key] = value;
    }
  }

  file.data.meta = meta;
};

export default rehypeExtractMeta;
