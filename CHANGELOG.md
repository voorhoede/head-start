# Changelog

See [documentation on Upgrading](docs/upgrading.md#find-the-changes).

## Unreleased

### Added

- **AccordionBlock** — dedicated block for accordion layouts. Has a boolean "Open first item on load" option. Replaces the `accordion-closed` / `accordion-open` layouts from `GroupingBlock`.
- **TabsBlock** — dedicated block for tabbed interfaces. Replaces the `tabs` layout from `GroupingBlock`.
- **StackBlock** — dedicated block for stacking items one after another, with an optional "Show titles" toggle. Replaces the `stack-titled` / `stack-untitled` layouts from `GroupingBlock`.
- **ColumnBlock** — new block that arranges nested blocks in 2, 3, or 4 side-by-side columns with responsive collapse.

### Changed

- Moved hosting from Cloudflare (Pages, and more recently Workers) to Bunny.net, with [Bunny's Astro adapter](https://github.com/BunnyWay/bunny-adapters/tree/main/packages/astro) and a GitHub Actions deploy workflow (`.github/workflows/deploy.yml`). See the [decision log](docs/decision-log/2026-09-30-workers-to-bunny.md).
  - The default production URL is now `https://<repository-name>.b-cdn.net` (override with a custom domain as before).
  - A DatoCMS build trigger starts the deploy workflow through GitHub's `repository_dispatch`. See [getting started](docs/getting-started.md#connect-datocms-to-the-deploy-workflow).
  - `npm run preview` now runs `astro preview`, which needs Deno 2. `npm run deploy`, `npm run cloudflare:build` and `wrangler` are removed.
  - Build environment variables `CF_PAGES*` and `WORKERS_CI*` are replaced by GitHub's `GITHUB_ACTIONS`, `GITHUB_REF_NAME` and `GITHUB_HEAD_REF`.
  - **Breaking:** `locals.runtime.cf` is replaced by `locals.runtime.country`, and `locals.runtime` is only set on routes that render on demand. City and coordinates are not available.
  - `DATOCMS_READONLY_API_TOKEN` and `HEAD_START_PREVIEW_SECRET` are no longer compiled into the server code; they are set as secrets on the Edge Script.
  - The preview branch is not deployed yet. Preview mode still works locally.
  - `/x` and `/x/` both answer 200 with the same page, where Cloudflare redirected one to the other. Canonical tags keep search engines on one URL.
  - Files other than HTML, such as `robots.txt`, are served with a one-year immutable `Cache-Control`. Every deploy purges the CDN cache.
- The service worker is now deployed. It was written outside the directory the host serves, so `/service-worker.js` answered 404.

- `AccordionBlock` (formerly `GroupingBlock` `accordion-open`): now only the **first** item starts expanded when "Open first item on load" is enabled. Previously all items were opened simultaneously, which was a bug.
- `GroupingBlock` is deprecated and will be removed in a future release. Use the new dedicated blocks for new content. Existing `GroupingBlock` records in the CMS should be migrated before removing the model.
