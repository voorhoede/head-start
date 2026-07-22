# Changelog

See [documentation on Upgrading](docs/upgrading.md#find-the-changes).

## Unreleased

### Changed

- Migrated hosting from Cloudflare Pages to Cloudflare Workers with static assets. Deployment now uses `wrangler deploy` via Cloudflare Workers Builds instead of the legacy Pages deployment pipeline.
- `npm run preview` now uses `wrangler dev` instead of `wrangler pages dev ./dist`.
- `npm run deploy` added as the explicit deploy command.
- Build environment variables updated: `CF_PAGES` / `CF_PAGES_BRANCH` / `CF_PAGES_URL` replaced by `WORKERS_CI` / `WORKERS_CI_BRANCH` / `WORKERS_CI_COMMIT_SHA`.
- Default production URL changed from `*.pages.dev` to `*.workers.dev` (override with a custom domain as before).
