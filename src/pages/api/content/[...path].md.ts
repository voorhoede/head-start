import type { APIRoute } from 'astro';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export const prerender = false;

export const GET: APIRoute = async ({ params, site }) => {
  params.path ||= '';

  const pageUrl = new URL(`/${params.path}/`, site);
  const res = await fetch(pageUrl, {
    headers: { Accept: 'text/html' },
  });
  
  if (res.status !== 200) {
    return res;
  }

  const html = await res.text();

  const md = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);

  return new Response(String(md), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
