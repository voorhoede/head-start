# Model configuration

Models in DatoCMS carry many attributes beyond fields. Most decisions made once at creation, lived with for project's lifetime. Reference categorizes them so next person (you, six months later) understands _what each flag changes_.

## Contents

- Three camps, not two
- Reserved model `api_key` values
- Field-reference attributes need two-step create
- Behaviour — lifecycle
- Behaviour — ordering (mutually-exclusive set)
- Behaviour — GraphQL surface
- UI — how editors see model
- Data — SEO fallbacks for `_seoMetaTags`
- Block model constraints (recap)
- Common mistakes

## Three camps, not two

Common framing splits attributes into "UI" vs "behaviour." Misses third camp that bites teams who don't know it exists.

| Camp | What changes | Examples |
| - | - | - |
| **Behaviour** | How records work — lifecycle, ordering, locale rules, GraphQL surface | `singleton`, `draft_mode_active`, `tree`, `ordering_field`, `all_locales_required` |
| **UI** | How editors see model in admin | `presentation_title_field`, `presentation_image_field`, `collection_appearance` |
| **CDA SEO fallbacks** | What public site renders in `<head>` when SEO field empty | `title_field`, `image_preview_field`, `excerpt_field` |

UI vs SEO-fallback split is trap: `title_field` and `presentation_title_field` _look_ similar but live in different worlds. See § "Don't confuse `title_field` with `presentation_title_field`."

## Reserved model `api_key` values

Following identifiers reserved and **cannot be used as model's `api_key`** — collide with GraphQL CDA's built-in `Site` query surface (`_site`, `_allItems`, etc.), API rejects at create time:

```
id, find, site, environment, available_locales, item_types,
single_instance_item_types, collection_item_types, items_of_type,
model
```

Pick different `api_key` (example `model_definition` instead of `model`, `place` instead of `site`).

## Field-reference attributes need two-step create

Before going through camps: many attributes (`title_field`, `image_preview_field`, `excerpt_field`, `presentation_title_field`, `presentation_image_field`, `ordering_field`) are _references to fields that don't exist yet_ when model first created. Must wire up after fields exist:

1. `itemTypes.create` — without any field-relationship attributes
2. `fields.create` for each field
3. `itemTypes.update` — wire `title_field`, `presentation_title_field`, etc. to now-existing field IDs

For full mechanic and ordering rules, see `../../datocms-cma/references/schema.md` § "Build order: model → fields → meta-relationships."

## Behaviour — lifecycle

### `singleton`

Marks model as single-instance. DatoCMS lazily auto-creates record on first UI visit or API call — `model.meta.has_singleton_item` initially `false`, flips when record materializes.

**Use for:** site settings, global config, footer, header, homepage, "about the company" — anything where exactly one record by definition.

**Don't use for:** anything where team might want second one later. Once model has fields, undoing `singleton` and adding more records is friction. If in doubt, leave singleton off and seed one record manually.

Block models can't be singletons (API enforces `singleton: false` for `modular_block: true`).

### `draft_mode_active`

Adds draft/published distinction to records — editors save drafts and explicitly publish. Required for visual editing and preview workflows.

**Always set `true` on every non-block model.** No exceptions for "internal" or "settings" models — cost of having draft mode unused is zero, cost of retrofitting it later (or shipping half-finished save) is real. Default on, always.

Block models can't have draft mode (blocks have no independent publication state — inherit from parent record). Must be `false` when `modular_block: true`.

### `draft_saving_active`

Lets editors save drafts that **don't satisfy field validations**. Validations only apply at publish time.

**Use when:** editors routinely work on long records over multiple sessions, would otherwise be blocked from saving by required fields they haven't filled in yet. Common for articles, complex landing pages.

**Skip when:** model represents data that should never exist in invalid state, even as draft. Settings, configuration, data-integrity-sensitive records.

**Invalid drafts still cannot be published.** Flag relaxes only _save_ gate — publishing record always requires every validator to pass. So `draft_saving_active: true` is pure ergonomics win for editors mid-flight; never lets bad data reach public CDA.

This is missing half of **required-by-default** strategy: make every field frontend needs `required`, then turn on `draft_saving_active` so editors can still save incomplete drafts. See `field-configuration.md` § "Make fields required by default" for full reasoning.

Flag has no effect unless `draft_mode_active: true` also set. Both must be `false` on block models.

### `all_locales_required`

When `true`, every localized field must have value in every project locale before record can be published.

**Use when:** team operates strict translation parity (legal content, structured data feeds, consistent product catalogs).

**Skip when:** locales fall back gracefully or content added per locale on rolling basis (typical editorial workflow). Forcing `all_locales_required: true` on editorial site usually backfires — editors stop publishing because Italian translations aren't ready.

Default (`false`) lets you publish record with only some locales populated; CDA serves whatever is there.

## Behaviour — ordering (mutually-exclusive set)

Model can use exactly one ordering strategy at time. Setting two of these together either fails or has one silently overriding other. Pick deliberately.

| Strategy | Set | Editors see | Use for |
| - | - | - | - |
| **Manual sort** | `sortable: true` | Drag-and-drop handle on each record | Curated lists where order is editorial: featured products, homepage cards, navigation |
| **Hierarchical tree** | `tree: true` | Drag-and-drop with indenting; parent/children built in | Categories, doc sections, anything that's "X is a kind of Y." See `taxonomy-classification.md`. |
| **By a field** | `ordering_field: { id, type: "field" }` + `ordering_direction` | Records sort by that field automatically | Natural sort key model already has: `published_at`, `priority`, `position_in_album` |
| **By a meta timestamp** | `ordering_meta: 'created_at' \| 'updated_at' \| 'first_published_at' \| 'published_at'` + `ordering_direction` | Records sort by record metadata | Pure chronological feeds where model has no domain-specific date field |
| **None (default)** | All of above null/false | Records appear in creation order | Reference data, lookup tables, anything where order is irrelevant |

### Decision shortcuts

- _"Do editors care about order?"_ → no → leave it default.
- _"Is order editorial / curated?"_ → yes → `sortable` (flat) or `tree` (hierarchical).
- _"Is there domain field that defines order?"_ → `ordering_field`.
- _"Order is purely chronological and model has no date field?"_ → `ordering_meta`.

`sortable`, `tree`, and `ordering_field` / `ordering_meta` are mutually exclusive in practice — sortable means _manual_ order, while ordering\_\* set means _automatic_ order. Block models must have all three off.

### Allowed field types for `ordering_field` and `ordering_meta`

`ordering_field` only accepts fields of these types — anything else (text, structured_text, link, file, json, color, etc.) is rejected:

```
string, date, date_time, integer, float, boolean
```

`ordering_meta` only accepts these record-meta timestamps:

```
created_at, updated_at, first_published_at, published_at
```

If natural sort key isn't one of orderable field types, either add sibling field of allowed type (example a `priority` integer alongside free-form `notes` text) or fall back to manual `sortable: true`.

## Behaviour — GraphQL surface

### `inverse_relationships_enabled`

When `true`, GraphQL CDA exposes inverse relationship fields on this model — given Author, you can query "all Articles that link to this Author" without writing reverse query manually.

**Use when:** frontend genuinely benefits from reverse traversal (author page that lists author's articles; category page that lists products in category).

**Skip when:** frontend always queries relationship from forward side. Inverse relationships add to GraphQL schema surface and don't auto-paginate the way collection queries do — can be expensive on high-fan-out models.

Block models can't enable inverse relationships.

## UI — how editors see model

These attributes only affect admin interface. Have no impact on public CDA, and changing them never causes content migration.

### `presentation_title_field` and `presentation_image_field`

What editors see when this model's records appear in:

- Model's collection (list view)
- Reference / link picker dialogs
- "Recent records" widgets and search results
- Visual editing references

Wire `presentation_title_field` to field that _editors_ can use to identify record at glance — usually human name, sometimes internal codename. Wire `presentation_image_field` to whichever image field gives clearest preview.

**Allowed field types** (API rejects anything else):

| Attribute | Accepted field types |
| - | - |
| `presentation_title_field` | `string`, `text`, `structured_text`, `slug`, `single_block`, `link`, `date`, `date_time`, `integer`, `float`, `color`, `lat_lon`, `video` |
| `presentation_image_field` | `file`, `gallery`, `single_block`, `link`, `color`, `date`, `date_time`, `lat_lon`, `video` |

Non-obvious entries are intentional: `link` resolves through to linked record's own presentation fields, and `single_block` resolves through to block's. Pure data fields like `boolean`, `json`, `seo`, `rich_text`, and `links` (multi) cannot be used.

### `collection_appearance`

Either `'table'` or `'compact'`. These are **two very different layouts**, not just density variants — pick based on model's role, not on visual taste.

- `'table'` — full-width table view with one column per configured field, image previews, saved views, advanced filters, sorting by column. This is standard "list of records" experience editors expect.
- `'compact'` — narrow vertical **sidebar** of records on left, with selected record opening to right of it. No image previews. No advanced filters — only plain text-search box. No per-column sorting. Trade-off is that editors can edit record while still seeing surrounding list.

**API default is `'compact'` when attribute omitted** — not what you usually want. Always set `'table'` explicitly on `itemTypes.create` unless model is genuinely a small reference / taxonomy collection.

`'compact'` only appropriate for **small reference / taxonomy-style models** where collection is short, records are tiny (often just label), and editors mostly jump between records to make small edits — example `Tag`, `Category`, `Redirect`, `Author`. Anything larger (blog posts, products, pages) belongs on `'table'`: editors need filters, saved views, and image previews that compact hides.

(Typo'd alias `collection_appeareance` exists in API surface; ignore it and use `collection_appearance`.)

## Data — SEO fallbacks for `_seoMetaTags`

`title_field`, `image_preview_field`, and `excerpt_field` look like their `presentation_*` siblings but don't drive admin UI. Feed **CDA's `_seoMetaTags` GraphQL field** (see `../../datocms-cda/references/seo-and-meta.md`):

| Model attr | Fallback for `_seoMetaTags` value | Allowed field types | When fallback kicks in |
| - | - | - | - |
| `title_field` | `<title>`, `og:title`, `twitter:title` | `string` only | Model has no SEO field, or SEO field's title is empty |
| `image_preview_field` | `og:image`, `twitter:image` | `file`, `gallery` | SEO field has no image set |
| `excerpt_field` | `<meta name="description">`, `og:description`, `twitter:description` | `string`, `text`, `structured_text` | SEO field has no description set |

Type allowlists are stricter than for `presentation_*_field` because these values feed real `<meta>` tags — `title_field` must be plain text (no `slug`, no `text`, no `structured_text`), and `excerpt_field` must be something that can be serialized to string description.

### Always wire these on user-facing models

If model represents public-facing page or record, wire all three. Editors will routinely forget to fill dedicated SEO field; fallbacks ensure page still ships with sensible meta tags instead of empty strings.

### Don't confuse `title_field` with `presentation_title_field`

They can be same field, and on simple models often are. But they serve different audiences:

- `presentation_title_field` is for **editors** browsing admin.
- `title_field` is for **public site's `<head>`** when SEO field is empty.

Worked example where they diverge:

```
Project model
  ├── codename             (string — internal: "Project Apollo")
  ├── public_name          (string — "Apollo Lunar Module Restoration")
  ├── cover_image          (file)
  └── seo                  (seo field)

presentation_title_field → codename     # editors recognize "Project Apollo"
title_field               → public_name  # the public site shows the real name
presentation_image_field  → cover_image
image_preview_field       → cover_image
```

Editors browsing admin see "Project Apollo" everywhere — fast identification. Public site, when SEO is unfilled, falls back to "Apollo Lunar Module Restoration" — name visitors should see.

## Block model constraints (recap)

When `modular_block: true`, API enforces these flags as `false`:

- `singleton`
- `sortable`
- `tree`
- `draft_mode_active`
- `draft_saving_active`
- `inverse_relationships_enabled`

`ordering_field`, `ordering_meta`, `ordering_direction` and `title_field` / `image_preview_field` / `excerpt_field` SEO fallbacks also don't apply meaningfully to blocks (block records aren't queried from `_seoMetaTags`; live inside parent records).

`presentation_title_field` and `presentation_image_field` _do_ apply to blocks — control how block instances appear in editor's block picker and inside Modular Content / Structured Text fields. Wire them when block has more than two or three fields, otherwise picker shows generic placeholders.

For model-vs-block decision itself, see `models-vs-blocks.md`.

## Common mistakes

- **Setting `singleton: true` and then needing two records.** Hard to walk back. Default to non-singleton; promote later only if "exactly one" constraint is genuinely permanent.
- **Skipping `title_field` / `image_preview_field` / `excerpt_field` on user-facing models.** Site ships with empty meta tags whenever editor forgets SEO field. Wire fallbacks.
- **Wiring `presentation_title_field` to SEO title field.** SEO title optimized for search engines, not for editor recognition. Use separate human-friendly field for admin preview.
- **Setting `sortable: true` on model with thousands of records.** Manual drag-and-drop doesn't scale. Use `ordering_field` or `ordering_meta` for high-cardinality models.
- **Omitting `collection_appearance` on a regular model.** API defaults to `'compact'` (sidebar layout) — editors lose filters, saved views, image previews, column sort. Set `'table'` explicitly unless model is a small reference / taxonomy collection.
- **Leaving `draft_mode_active: false` on non-block model.** Always on by default — unused draft mode costs nothing, retrofitting it later does.
- **Setting `draft_saving_active: true` without `draft_mode_active`.** No effect — drafts don't exist without draft mode.
- **`all_locales_required: true` on editorial content.** Editors stop being able to publish until every translation is in. Almost always wrong outside of legal/structured-data contexts.
- **Forgetting that field-reference attributes need second `itemTypes.update` after fields are created.** Model is created fine but editor sees placeholders instead of titles, and CDA's `_seoMetaTags` fallback chain has nothing to fall back to.
