# Records (Items)

Records: model instances. Most-used CMA resource.

> Endpoint shapes / payloads / TS sigs: `npx datocms cma:docs {items|itemVersions} <action>` (add `--expand-types '*'` for full TS definitions). Only what docs don't carry below.

## Contents

- Reading: `nested: true` is the primary knob
- Selective publish / unpublish
- `validateNew` / `validateExisting` — preflight without commit
- Versions and restore
- Field value formats — beyond the simple types
- Reading structured text as dastdown markdown
- Bulk operations are async + 200-cap
- Typed records via generated `Schema.X`

## Reading: `nested: true` is the primary knob

Records with Modular Content / Structured Text / Single Block fields default to returning **block IDs**, not block content. To get full block payloads inline, pass `nested: true`:

```ts
const record  = await client.items.find<Schema.BlogPost>("id"); // blocks as ID strings
const nested  = await client.items.find<Schema.BlogPost>("id", { nested: true }); // blocks as full objects
```

Two consequences:

- Without `nested: true`, you only have block ids — must re-fetch parent with nested to read contents.
- With `nested: true`, iterator max page size drops from 500 to 30 (see `references/filtering-and-pagination.md`). Plan for round-trip cost on large scans.

`version: "current" | "published" | "published-or-current"` controls draft vs published view (default `current`). Use `published` for public consumers; use `published-or-current` for previews (published if exists, else current draft).

## Selective publish / unpublish

Body is optional — omit it to publish/unpublish the entire record. Pass an object to limit to specific locales or non-localized content only:

```ts
await client.items.publish(id, {
  content_in_locales: ["en", "it"],
  non_localized_content: true,
});
```

Useful when some locales finish before others — publish ready locales now without lying about field values to satisfy validators.

For tree-model records, `{ recursive: true }` as the third argument auto-cascades:

- `publish` with `recursive: true` auto-publishes unpublished parents (avoids `UNPUBLISHED_PARENT`).
- `unpublish` with `recursive: true` auto-unpublishes published children (avoids dangling published descendants).

## `validateNew` / `validateExisting` — preflight without commit

Same input shapes as `create` / `update` respectively, but no commit. Throw the same `ApiError` shape on validation failure.

## Versions and restore

`itemVersions.listPagedIterator(recordId)` walks history. `itemVersions.restore(versionId)` creates a **new version** whose content matches the restored one — it does not delete history, and it does not re-publish: the record's publication state stays where it was. If the record was published before the restore and you want the restored content live, call `publish` explicitly afterward.

## Field value formats — beyond the simple types

Scalar types (`string`, `integer`, `float`, `boolean`, `date`, `date_time`, `slug`, `text`, `json` as a stringified JSON) take the values their TypeScript types suggest. The structural ones below are the ones that surprise:

- **Color**: `{ red, green, blue, alpha }` — each 0–255, including alpha (not 0–1).
- **LatLon**: `{ latitude, longitude }`.
- **SEO**: `{ title, description, image: <upload-id> | null, twitter_card: "summary" | "summary_large_image" | null, no_index: boolean | null }`.
- **Video (external)**: `{ url, title, width, height, provider, provider_uid, thumbnail_url }` — providers are `youtube` | `vimeo` | `facebook`. The CMA does not auto-fetch metadata; you must populate all fields.
- **Single file**: minimal `{ upload_id }` (uses upload's `default_field_metadata`); to override, provide all four `{ upload_id, alt, title, custom_data, focal_point }` (omitted ones become `null`/`{}`, not the upload's defaults — see `references/uploads.md` § Metadata).
- **Gallery**: array of single-file objects (same shape as above, per element).
- **Single link**: a record id string or `null`.
- **Multiple links**: array of record id strings.

Modular Content, Structured Text, and Single Block fields are complex enough to merit their own reference — see `references/editing-records.md`.

## Reading structured text as dastdown markdown

The `datocms-structured-text-dastdown` package serializes a DAST tree to a markdown-like string (and parses it back). For read-only use — displaying content, feeding to an LLM, extracting plain text, diffing — `serialize` alone is enough; `parse` is for the editing round-trip (see `editing-records.md` § Pass 1).

> **Ambient-globals runtimes** (`cma:script` stdin-mode, MCP `upsert_and_execute_{safe,unsafe}_script`): `parse` / `serialize` already global — skip `import`. **Explicit-import runtimes** (`cma:script` file-mode, migrations): import as shown.

```ts
import { serialize } from "datocms-structured-text-dastdown";

const article = await client.items.find<Schema.Article>(id, { nested: true });
if (article.content) {
  const text = serialize(article.content);
  // text is dastdown markdown — paragraphs, headings, lists, blocks-as-id placeholders
}
```

`nested: true` matters here too: without it, blocks inside the structured text are id strings only, and `serialize` encodes them as `<block id="…"/>` placeholders without any block content visible.

### dastdown syntax — what's NOT plain markdown

Markdown-identical: `# H1`–`###### H6`, paragraphs, `- ` / `1. ` lists (2-space indent for nesting), `> ` blockquote, ` ```lang ` fences, `---` thematic break, `**strong**` `*emphasis*` `` `code` `` `~~strike~~`, `[text](url)`, `\` escapes.

**Tables are NOT supported!**

Everything dastdown adds, in one document:

\| # Heading {style="display"} ← style trailer on heading line | | Paragraph with ==highlight==, ++underline++, custom mark <m k="footnote-ref">x</m>, and span-internal<br/>linebreak. | {style="lead"} ← paragraph style: own line AFTER | | > Quote body. | {attribution="Oscar Wilde"} ← blockquote attribution: own line AFTER | | `js {highlight=[0,2]} ← highlight 0-indexed; no escapes inside fence | code | ` | | Link with meta: [text](https://x.com){rel="nofollow" target="\_blank"} Record link: [text](dato:item/RECORD_ID){rel="nofollow"} Inline refs: <inlineItem id="…"/>  <inlineBlock id="…"/> | | <block id="…"/> ← root-level only, own line

Rules that bite:

- `<block|inlineBlock|inlineItem id="…"/>` and `dato:item/ID`: opaque record refs. Don't invent ids — `parse` throws on unknown `block`/`inlineBlock` ids; create them in Pass 2 (see `editing-records.md`) instead.
- Mark canonical order outer→inner: `highlight → strikethrough → underline → strong → emphasis → code`; custom marks innermost, alphabetical. Serializer rewrites freely — don't depend on input order.
- Canonicalization also drops empty spans and coalesces adjacent same-marks spans. `parse(null|undefined)` → `null`; `parse("")` → single empty paragraph.

## Bulk operations are async + 200-cap

`bulkPublish`, `bulkUnpublish`, `bulkDestroy`, `bulkMoveToStage` accept `{ items: [{ id, type: "item" }] }` and run as background jobs (the simplified client awaits completion). Max **200 items per request** — chunk larger sets. See `references/client-types-and-behaviors.md` § Technical Limits.

## Typed records via generated `Schema.X`

Every method that returns or accepts a record (`find`, `list`, `create`, `update`, `publish`, etc.) takes a generic `Shape.X`. Pass a generated `Schema.BlogPost` marker and TypeScript knows the per-field shape — `record.title` is `string`, `record.cover_image` is the file shape, etc. — instead of `unknown`.

```ts
const post = await client.items.find<Schema.BlogPost>(id);          // blocks as ID strings
const nested = await client.items.find<Schema.BlogPost>(id, { nested: true }); // blocks expanded
```

To extract the type of a specific field for an intermediate variable, index `ApiTypes.Item<Schema.BlogPost>["field_api_key"]` (or `ApiTypes.ItemInNestedResponse<…>["…"]` when reading nested). For create/update payloads, `ApiTypes.ItemCreateSchema<Schema.BlogPost>` / `ApiTypes.ItemUpdateSchema<Schema.BlogPost>`. See `references/type-generation.md` for the generation step.
