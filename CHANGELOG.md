# Changelog

See [documentation on Upgrading](docs/upgrading.md#find-the-changes).

## Unreleased

### Added

- **AccordionBlock** — dedicated block for accordion layouts. Has a boolean "Open first item on load" option. Replaces the `accordion-closed` / `accordion-open` layouts from `GroupingBlock`.
- **TabsBlock** — dedicated block for tabbed interfaces. Replaces the `tabs` layout from `GroupingBlock`.
- **StackBlock** — dedicated block for stacking items one after another, with an optional "Show titles" toggle. Replaces the `stack-titled` / `stack-untitled` layouts from `GroupingBlock`.
- **ColumnBlock** — new block that arranges nested blocks in 2, 3, or 4 side-by-side columns with responsive collapse.

### Changed

- Migrated hosting from Cloudflare Pages to Cloudflare Workers with static assets. Deployment now uses `wrangler deploy` via Cloudflare Workers Builds instead of the legacy Pages deployment pipeline.
- `npm run preview` now uses `wrangler dev` instead of `wrangler pages dev ./dist`.
- `npm run deploy` added as the explicit deploy command.
- Build environment variables updated: `CF_PAGES` / `CF_PAGES_BRANCH` / `CF_PAGES_URL` replaced by `WORKERS_CI` / `WORKERS_CI_BRANCH` / `WORKERS_CI_COMMIT_SHA`.
- Default production URL changed from `*.pages.dev` to `*.workers.dev` (override with a custom domain as before).

- `AccordionBlock` (formerly `GroupingBlock` `accordion-open`): now only the **first** item starts expanded when "Open first item on load" is enabled. Previously all items were opened simultaneously, which was a bug.
- `GroupingBlock` is deprecated and will be removed in a future release. Use the new dedicated blocks for new content. Existing `GroupingBlock` records in the CMS should be migrated via `scripts/cms-migrate-grouping-blocks.ts` before the cleanup migration (`1779805400_removeGroupingBlock.ts`) is applied.
