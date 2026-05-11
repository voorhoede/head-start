import type { Root } from 'hast';
import type { Plugin } from 'unified';
import { select } from 'hast-util-select';

const rehypeExtractMain: Plugin<[], Root> = () => (tree) => {
  const main = select('main', tree);
  if (main) {
    tree.children = main.children;
  } else {
    tree.children = [];
  }
};

export default rehypeExtractMain;
