# Resource gotchas

CRUD surface in `npx datocms cma:docs <resource> <action>` — always up-to-date, generated live.

For `cma:docs` command surface, load **datocms-cli** skill, read `../../datocms-cli/references/direct-cma-calls.md` § cma:docs — single source of truth.

This file indexes what `cma:docs` doesn't spell out — gotchas, runtime semantics, cross-cutting patterns. No signature duplication here.

## Contents

- Webhooks (`webhooks`)
- Build triggers (`buildTriggers`)
- Scheduling (`scheduledPublication`, `scheduledUnpublishing`)
- Workflows (`workflows`)
- Saved filters (`itemTypeFilters`, `uploadFilters`)
- Plugins (`plugins`)
- Dashboard and schema menus (`menuItems`, `schemaMenuItems`)
- Upload tracks and tags (`uploadTracks`, `uploadTags`, `uploadSmartTags`)
- Audit log events (`auditLogEvents`)

## Webhooks (`webhooks`)

`cma:docs webhooks` covers create/update/list/find/destroy, `events`/`filters`/`custom_payload` shape.

What `cma:docs` does **not** spell out:

- **Timeouts:** 2s connection, 8s execution per delivery. Heavy work must be deferred — return 200 fast, process async.
- **Auto-retry** (`auto_retry: true`): up to 7 retries — 2 min, 6 min, 30 min, 1 hr, 5 hrs, 1 day, 2 days.
- **Event lifecycle on draft/published:** create → `create`, publish → `publish`, edit-published → `update`, re-publish → `publish`, unpublish → `unpublish`, delete-published → `unpublish` + `delete`. On models without draft/published: create → `create` + `publish`, update → `update` + `publish`, delete → `unpublish` + `delete`.
- **Cache-tag invalidation** (`entity_type: "cda_cache_tags"`, `event_types: ["invalidate"]`): does **not** support filters — always fires for all cache tag changes; cannot narrow to specific models/records. Payload carries `entity.attributes.tags: string[]`. For architectural patterns, see `skills/datocms-cda/references/draft-caching-environments.md`.
- **Webhook history:** `client.webhookCalls.listPagedIterator({ filter: { webhook_id } })` lists past deliveries; `client.webhookCalls.resendWebhook(callId)` re-delivers failed call.

## Build triggers (`buildTriggers`)

`cma:docs buildTriggers` covers create/update/list/find/destroy, adapters (`custom`, `netlify`, `vercel`, `gatsby_cloud`, `circle_ci`, `github_actions`, `travis_ci`, etc.), trigger/abort actions, `build_events`.

What `cma:docs` does **not** spell out:

- `autotrigger_on_scheduled_publications: true` bridges scheduling and deploys — without it, scheduled publish/unpublish does **not** trigger build.
- Indexed CMA search requires build trigger with `indexing_enabled: true` configured before `searchResults.list()` returns anything (see "CMA search results" below).

## Scheduling (`scheduledPublication`, `scheduledUnpublishing`)

`cma:docs scheduledPublication`, `cma:docs scheduledUnpublishing` cover create/destroy, `selective_publication` shape (`{ content_in_locales, non_localized_content }`).

What `cma:docs` does **not** spell out:

- `publication_scheduled_at` / `unpublishing_scheduled_at` must be ISO 8601 **in the future** — past timestamps rejected.
- Single record can carry both scheduled publication and scheduled unpublishing simultaneously — time-limited visibility window (publish on Christmas, unpublish on New Year's).
- Scheduled publication triggers deploy only if relevant build trigger has `autotrigger_on_scheduledPublications: true`.

## Workflows (`workflows`)

`cma:docs workflows` covers create/update/list/find/destroy, `stages` array shape.

What `cma:docs` does **not** spell out:

- Exactly one stage in `stages` must have `initial: true` — new draft records land there.
- Assign workflow to model via `client.itemTypes.update(modelId, { workflow: { id, type: "workflow" } })` — workflows not linked at creation.
- Move records between stages via `client.items.bulkMoveToStage({ items: [{ id, type: "item" }], stage: "review" })` — bulk endpoint is the only API, even for single record.

## Saved filters (`itemTypeFilters`, `uploadFilters`)

`cma:docs itemTypeFilters`, `cma:docs uploadFilters` cover create/update/list/find/destroy, `filter` / `columns` / `order_by` / `shared` attributes.

What `cma:docs` does **not** spell out:

- `filter` object mirrors **UI's internal filter state** — exact shape depends on which field/meta filters are active in dashboard. Copy from saved view in UI rather than hand-writing.
- `order_by` uses field-name + direction suffix: `"_updated_at_DESC"`, `"_created_at_ASC"`, `"<field_api_key>_ASC"`.
- `shared: true` makes filter visible to all team members; `false` keeps it private to creator. No per-role visibility.

## Plugins (`plugins`)

`cma:docs plugins` covers create/update/list/find/destroy, `parameters` / `parameter_definitions` shape.

What `cma:docs` does **not** spell out:

- Pass exactly one of `package_name` (marketplace) or `url` (custom) to `client.plugins.create()` — never both.
- `parameters` is project-specific instance configuration; shape derives from plugin's `parameter_definitions` schema (set by plugin author).
- "Find fields using a plugin" requires listing all fields, inspecting `appearance.editor` / `appearance.addons[].id` against plugin id — no dedicated endpoint.

## Dashboard and schema menus (`menuItems`, `schemaMenuItems`)

`cma:docs menuItems`, `cma:docs schemaMenuItems` cover create/update/list/find/destroy, `label` / `position` / `parent` / `item_type` / `external_url` attributes.

What `cma:docs` does **not** spell out:

- Leaf `menu_item` references either `item_type` **or** `external_url`, never both. Parent folder typically has neither — just groups children by `parent`.
- `position` is **per-parent** — siblings under same `parent` (or top-level when `parent` is null) ordered by `position` numbers; positions across different parents independent.
- Reordering done by updating `position` on each affected sibling — API does not expose "move up/down" or "reorder" action.

## Upload tracks and tags (`uploadTracks`, `uploadTags`, `uploadSmartTags`)

`cma:docs uploadTracks`, `cma:docs uploadTags`, `cma:docs uploadSmartTags` cover CRUD surface, attributes.

What `cma:docs` does **not** spell out:

- **Track creation is async job.** Freshly created track returns with `status: "preparing"`; poll `client.uploadTracks.list(uploadId)` until `status: "ready"` (or `"errored"` with populated `error` field) before treating track as available.
- `language_code` must be **BCP 47** (`"en"`, `"en-US"`, `"fr"`, `"pt-BR"`, …). `type` is `"subtitles"` or `"audio"`. `closed_captions: true` flags SDH (Deaf / Hard-of-hearing) variants.
- **Tags ≠ smart tags.** `client.uploadTags` is user-managed, project-wide tag dictionary; `client.uploadSmartTags` is AI-generated set tied to each upload (read-only, populated by DatoCMS image analysis pipeline). On `upload`, `tags: string[]` carries manual tags; smart tags surfaced through upload's smart-tags endpoint, not on upload object itself.
- Tracks are video-only — adding track to non-video upload errors at create time.

## Audit log events (`auditLogEvents`)

`cma:docs auditLogEvents` covers `query` / `rawQuery`, filter parameters.

What `cma:docs` does **not** spell out:

- **Cursor pagination.** Audit log is the **only** resource that does not use offset/limit. `query()` returns single page; for full traversal use `rawQuery()`, feed `result.meta.next_token` back as `page.token` until it stops appearing.
- `rawQuery()` returns raw JSON:API — event data sits under `result.data[].attributes`, not flattened like `query()`.
- **Action name prefix matters.** Single-record operations log under `items.*` (`items.create`, `items.publish`, `items.destroy`, …). Bulk operations log under `item_bulk_operations.*` (`item_bulk_operations.publish`, `item_bulk_operations.destroy`, …), emit **single event** with all affected record ids in `request.payload.data.relationships.items` — filtering by request path misses them.
- `detailed_log: true` on `rawQuery` returns full request/response payloads (heavier, useful for forensic debugging).
