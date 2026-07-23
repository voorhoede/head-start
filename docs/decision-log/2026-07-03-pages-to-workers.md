# Cloudflare Pages to Workers migration

**Migrate hosting from Cloudflare Pages to Cloudflare Workers with static assets.**

- Date: 2026-07-03
- Decision Made By: [Marleen](https://github.com/marleendijkman)

## Decision

Migrate the project from Cloudflare Pages to Cloudflare Workers

## Why

Cloudflare has deprecated Cloudflare Pages and will turn to Cloudflare Workers.
The `@astrojs/cloudflare` adapter v13+ explicitly targets Workers only and drops Pages support.

## What changed
The below is in accordance with the [official migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- `wrangler.toml` udpated with Workers-specific config: `main`, `assets` with `binding`, `nodejs_compat` flag.
- `public/.assetsignore` added so `_worker.js` and `_routes.json` are not served as static files.
- `npm run preview` now uses `wrangler dev` (instead of `wrangler pages dev ./dist`).
- `npm run deploy` added as the deploy command.
- `CF_PAGES` / `CF_PAGES_BRANCH` / `CF_PAGES_URL` env vars replaced by the Workers Builds equivalents: `WORKERS_CI`, `WORKERS_CI_BRANCH`, `WORKERS_CI_COMMIT_SHA`.
- `siteUrl` in `astro.config.ts` now resolves to `productionUrl` on any Workers Builds run (Workers Builds has no per-deploy branch preview URL env var equivalent to `CF_PAGES_URL`).
