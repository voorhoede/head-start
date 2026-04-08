// robots.txt contains dynamic content, which can be determined at build time.
// so we use this API route to prerender the robots.txt file.
import type { APIRoute } from 'astro';
import { datocmsRequest } from '~/lib/datocms';
import type { RobotsTxtQuery } from '~/lib/datocms/types';
import { robotsTxt } from '~/lib/seo';
import query from './_robots.query.graphql';
import { getEntry } from '~/lib/content';

export const prerender = true;

const entry = await getEntry('App', 'default');

export const GET: APIRoute = async (context) => {
  const { site } = await datocmsRequest<RobotsTxtQuery>({ query });
  const allowAll = !site.noIndex && !context.locals.isPreview;
  const allowAiBots = allowAll && Boolean(entry?.data.allowAiBots);

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
