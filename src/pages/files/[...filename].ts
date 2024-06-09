import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ params }) => {
  const url = `https://www.datocms-assets.com/${params.filename}`;
  return fetch(url);
  // return new Response('',{
  //   status: 307,
  //   headers: { 'Location': `https://www.datocms-assets.com/${params.filename}` },
  // });
};
