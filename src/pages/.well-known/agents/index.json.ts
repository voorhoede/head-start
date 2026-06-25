// Web registry counterpart to the DNS-AID `_index._agents.<domain>` record.
// Prerendered (build time) so site name/url come from project config, mirroring
// `robots.txt.ts` and `llms.txt.ts`.
//
// NOTE: the actual DNS-AID discovery (SVCB/HTTPS DNS records under `_agents` +
// DNSSEC signing) lives in your DNS zone (e.g. Cloudflare DNS), not in this repo.
// @see https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/
import type { APIRoute } from 'astro';
import { defaultLocale } from '~/lib/i18n';
import { globalSeo } from '~/lib/site.json';
import { agentsIndex } from '~/lib/seo';

export const prerender = true;

export const GET: APIRoute = (context) => {
  const seo = globalSeo[defaultLocale as keyof typeof globalSeo] ?? globalSeo;

  return new Response(
    JSON.stringify(
      agentsIndex({
        siteName: seo.siteName ?? '',
        siteSummary: seo.fallbackSeo?.description ?? '',
        siteUrl: context.site!.origin,
      }),
      null,
      2,
    ),
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
};
