import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { select } from 'hast-util-select';

const rehypeExtractNoindex: Plugin<[], Root> = () => (tree, file) => {
  const robotsMeta = select('meta[name="robots"]', tree);
  const robotsContent = robotsMeta?.properties?.content;
  const contentStr = Array.isArray(robotsContent)
    ? robotsContent.join(', ')
    : typeof robotsContent === 'string' ? robotsContent : '';
  file.data.noindex = contentStr.toLowerCase().includes('noindex');
};

export default rehypeExtractNoindex;
