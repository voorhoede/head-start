// robots.txt contains dynamic content, which can be determined at build time.
// so we use this API route to prerender the robots.txt file.
import type { APIRoute } from 'astro';
import { datocmsRequest } from '@lib/datocms';
import type { RobotsTxtQuery } from '@lib/datocms/types';
import { robotsTxt } from '@lib/seo';
import query from './_robots.query.graphql';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const { app, site } = await datocmsRequest<RobotsTxtQuery>({ query });
  const allowAll = !site.noIndex && !context.locals.isPreview;
  const allowAiBots = allowAll && Boolean(app?.allowAiBots);

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
