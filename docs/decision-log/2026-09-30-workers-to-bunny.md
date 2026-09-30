# Cloudflare Workers to Bunny.net migration

**Move hosting from Cloudflare Workers to Bunny.net.**

- Date: 2026-09-30
- Decision Made By: [Luuk](https://github.com/slimluccii)

## Decision

Host Head Start on Bunny.net: pages that render on demand run as a Bunny Edge Script with [Bunny's Astro adapter](https://github.com/BunnyWay/bunny-adapters/tree/main/packages/astro), the built files live in Bunny Storage, and a GitHub Actions workflow deploys both with [bunny-edge-deploy](https://github.com/voorhoede/bunny-edge-deploy).

## What changed

- `@astrojs/cloudflare` and `wrangler` are replaced by `@bunny.net/astro-adapter`, pinned to an exact version because the adapter is still a lab release. `wrangler.toml`, `public/.assetsignore` and `public/_headers` are removed.
- Security and `Link` headers on prerendered pages come from the existing middleware. The adapter records the headers a page gets at build time and sends them with that page.
- Sessions are off, since nothing uses them. Otherwise the adapter would need a storage password that can write.
- The adapter's list of built files is off (`assetManifest: false`). It is taken before `@astrojs/sitemap` and the service worker integration write their files, which would make those files unreachable.
- Shiki is kept out of the Edge Script (`config/astro/without-shiki.ts`). `@datocms/astro` pulls in Astro's `<Code>` for a code node that `Text.astro` replaces, and Shiki alone would push the script past Bunny's 10 MB limit.
- The DatoCMS token and preview secret are read from the Edge Script's secrets at runtime instead of being compiled into the server code.
- Workers Builds is replaced by `.github/workflows/deploy.yml`; `WORKERS_CI*` variables by `GITHUB_ACTIONS` and `GITHUB_REF_NAME`.

## Consequences

- `/x` and `/x/` both answer 200 with the same page; the Workers static assets redirected one to the other. Canonical tags keep search engines on one URL.
- Files other than HTML, such as `robots.txt` and `llms.txt`, are served with the adapter's immutable one-year `Cache-Control`. Every deploy purges the CDN, but not browsers.
- Rebuilding when editors publish in DatoCMS still has to be connected to the deploy workflow.
- Preview deployments per branch are not set up; each would need its own Edge Script and pull zone.
