// robots.txt contains dynamic content, which can be determined at build time.
// so we use this API route to prerender the robots.txt file.
import type { APIRoute } from 'astro';

export const prerender = true;

const robotsTxt = ({ siteUrl }: { siteUrl: string }) => `

User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap-index.xml

`.trim();

export const GET: APIRoute = (context) => {
  return new Response(robotsTxt({
    siteUrl: context.site!.origin,
  }), {
    headers: {
      'content-type': 'text/plain',
    },
  });
};
