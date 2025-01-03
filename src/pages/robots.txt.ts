// robots.txt contains dynamic content, which can be determined at build time.
// so we use this API route to prerender the robots.txt file.
import type { APIRoute } from 'astro';
import aiRobotsTxt from '@lib/seo/ai.robots.txt';
import { datocmsRequest } from '@lib/datocms';
import type { RobotsTxtQuery } from '@lib/datocms/types';
import query from './_robots.query.graphql';

export const prerender = true;

interface Props {
  allowAiBots: boolean;
  allowAll: boolean;
  siteUrl: string;
}
const robotsTxt = ({ allowAiBots, allowAll, siteUrl }: Props) => `
${allowAiBots ? '' : aiRobotsTxt}

User-agent: *
${allowAll ? 'Allow: /' : 'Disallow: /'}

Sitemap: ${siteUrl}/sitemap-index.xml

`.trim();

export const GET: APIRoute = async (context) => {
  const { /*app, */ site } = await datocmsRequest<RobotsTxtQuery>({ query });
  const allowAiBots = false; /* app?.allowAiBots; */
  const allowAll = !site.noIndex && !context.locals.isPreview;

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
