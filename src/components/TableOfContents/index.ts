import { fromHtml } from 'hast-util-from-html';
import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';

export type TreeItem = {
  id: string;
  level: number;
  text: string;
  items?: TreeItem[];
};

export const extractTocItemsFromHtml = (html: string) => {

  const hast = fromHtml(html, { fragment: true });
  const tagNames = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  const items: TreeItem[] = [];

  visit(hast, 'element', (node) => {
    if (tagNames.has(node.tagName) && node.properties?.id) {
      const text = toString(node);
      const item: TreeItem = {
        id: String(node.properties.id),
        level: parseInt(node.tagName.slice(1), 10),
        text,
      };
      const lastItem = items[items.length - 1];
      if (lastItem && lastItem.level < item.level) {
        lastItem.items = lastItem.items ?? [];
        lastItem.items.push(item);
      } else {
        items.push(item);
      }
    }
  });

  return items;
};
