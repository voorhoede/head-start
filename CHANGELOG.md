# Changelog

See [documentation on Upgrading](docs/upgrading.md#find-the-changes).

## Unreleased

### Added

- **AccordionBlock** — dedicated block for accordion layouts. Has a boolean "Open first item on load" option. Replaces the `accordion-closed` / `accordion-open` layouts from `GroupingBlock`.
- **TabsBlock** — dedicated block for tabbed interfaces. Replaces the `tabs` layout from `GroupingBlock`.
- **StackBlock** — dedicated block for stacking items one after another, with an optional "Show titles" toggle. Replaces the `stack-titled` / `stack-untitled` layouts from `GroupingBlock`.
- **ColumnBlock** — new block that arranges nested blocks in 2, 3, or 4 side-by-side columns with responsive collapse.

### Changed

- `AccordionBlock` (formerly `GroupingBlock` `accordion-open`): now only the **first** item starts expanded when "Open first item on load" is enabled. Previously all items were opened simultaneously, which was a bug.
- `GroupingBlock` is deprecated and will be removed in a future release. Use the new dedicated blocks for new content. Existing `GroupingBlock` records in the CMS should be migrated via `scripts/cms-migrate-grouping-blocks.ts` before the cleanup migration (`1779805400_removeGroupingBlock.ts`) is applied.
