import type { APIRoute } from 'astro';
import { fromHtml } from 'hast-util-from-html';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { PageQuery } from '@lib/datocms/types';
import { datocmsRequest } from '@lib/datocms';
import { renderBlocks } from '@blocks/index';
import query from '@pages/[locale]/[...path]/_index.query.graphql';

export const prerender = false;

export const GET: APIRoute = async () => {

  const variables = { locale: 'en', slug: 'getting-started' };
  const { page } = (await datocmsRequest<PageQuery>({ query, variables }));

  if (!page) {
    return new Response('', { status: 404 });
  }

  const html = await renderBlocks(page.bodyBlocks);
  const hast = fromHtml(html);
  const mdast = toMdast(hast);
  const markdown = toMarkdown(mdast);
  const content = `# ${page.title}\n\n${markdown}`; //.replace(/Â&nbsp;/g, ' ');

  return new Response(content, { headers: { 'content-type': 'text/markdown' } });
};
