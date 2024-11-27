import GithubSlugger from 'github-slugger';
import { fromHtml } from 'hast-util-from-html';
import { toString } from 'hast-util-to-string';

const slugger = new GithubSlugger();

export const resetHtmlIdSlugger = () => {
  slugger.reset();
};

export const htmlIdSlug = ({ id, html }: { id?: string; html: string }) => {
  if (id) {
    return slugger.slug(id);
  }
  const tree = fromHtml(html, { fragment: true });
  const text = toString(tree);
  return slugger.slug(text);
};
