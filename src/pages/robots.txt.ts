// robots.txt contains dynamic content, which can be determined at build time.
// so we use this API route to prerender the robots.txt file.
import type { APIRoute } from 'astro';
import { robotsTxt } from '~/lib/seo';
import app from '~/lib/app';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const allowAll = !app.noIndex && !context.locals.isPreview;
  const allowAiBots = allowAll && Boolean(app.allowAiBots);

  return new Response(robotsTxt({
    allowAiBots,
    allowAll,
    siteUrl: context.site!.origin,
  }), {
    headers: {
      'content-type': 'text/plain',
    },
  });
};
