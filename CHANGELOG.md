# Changelog

See [documentation on Upgrading](docs/upgrading.md#find-the-changes).

## Unreleased

### Added

- **AccordionBlock** — dedicated block for accordion layouts. Has a boolean "Open first item on load" option. Replaces the `accordion-closed` / `accordion-open` layouts from `GroupingBlock`.
- **TabsBlock** — dedicated block for tabbed interfaces. Replaces the `tabs` layout from `GroupingBlock`.
- **StackBlock** — dedicated block for stacking items one after another, with an optional "Show titles" toggle. Replaces the `stack-titled` / `stack-untitled` layouts from `GroupingBlock`.
- **ColumnBlock** — new block that arranges nested blocks in 2, 3, or 4 side-by-side columns with responsive collapse.

### Changed

- Moved hosting from Cloudflare Workers to Bunny.net, with [Bunny's Astro adapter](https://github.com/BunnyWay/bunny-adapters/tree/main/packages/astro) and a GitHub Actions deploy workflow (`.github/workflows/deploy.yml`). See the [decision log](docs/decision-log/2026-09-30-workers-to-bunny.md).
- `npm run preview` now runs `astro preview`, which needs Deno 2. `npm run deploy`, `npm run cloudflare:build` and `wrangler` are removed.
- Build environment variables `WORKERS_CI` / `WORKERS_CI_BRANCH` replaced by GitHub's `GITHUB_ACTIONS` / `GITHUB_REF_NAME`.
- `DATOCMS_READONLY_API_TOKEN` and `HEAD_START_PREVIEW_SECRET` are no longer compiled into the server code; they are set as secrets on the Edge Script.
- The service worker is now deployed. It was written outside the directory the host serves, so `/service-worker.js` answered 404.
- Migrated hosting from Cloudflare Pages to Cloudflare Workers with static assets. Deployment now uses `wrangler deploy` via Cloudflare Workers Builds instead of the legacy Pages deployment pipeline.
- `npm run preview` now uses `wrangler dev` instead of `wrangler pages dev ./dist`.
- `npm run deploy` added as the explicit deploy command.
- Build environment variables updated: `CF_PAGES` / `CF_PAGES_BRANCH` / `CF_PAGES_URL` replaced by `WORKERS_CI` / `WORKERS_CI_BRANCH` / `WORKERS_CI_COMMIT_SHA`.
- Default production URL changed from `*.pages.dev` to `*.workers.dev` (override with a custom domain as before).

- `AccordionBlock` (formerly `GroupingBlock` `accordion-open`): now only the **first** item starts expanded when "Open first item on load" is enabled. Previously all items were opened simultaneously, which was a bug.
- `GroupingBlock` is deprecated and will be removed in a future release. Use the new dedicated blocks for new content. Existing `GroupingBlock` records in the CMS should be migrated before removing the model.
