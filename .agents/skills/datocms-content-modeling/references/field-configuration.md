# Field configuration: validators and appearance

Every field has two settings beyond `field_type`: **validators** (accepted values) and **appearance** (editor + parameters). Defaults sensible — most fields don't need explicit `appearance`. This reference covers choices that _matter_ for content modeling.

> For full TypeScript shape, run `npx datocms cma:docs fields create --expand-types '<TypeName>'` (e.g. `StringFieldValidators`, `FileFieldAppearance`).

## Contents

- Defaults are usually right
- Make fields required by default
- Validators worth remembering
- Appearance — when defaults aren't enough
- Cross-cutting field attributes
- Common mistakes

## Defaults are usually right

Each `field_type` has a default editor (default editor for `text` → `markdown`). Omit `appearance` for common case; set it when:

- Different built-in editor fits better (`textarea` vs `markdown`, `string_select` + `enum`).
- Tuning editor parameters (slug `url_prefix`, color `preset_colors`, `single_line` `heading: true`).
- Wiring plugin-provided editor/add-on.

Validators differ — defaults give "anything goes." Use when field has meaningful constraint editors should be helped/stopped by.

## Make fields required by default

`required` deserves separate decision frame — shapes _frontend code_ and _editor workflow_.

**Frontend tax of optional fields.** Every non-required field is `T | null` — 20 optional fields = 20 conditionals, 20 fallbacks, 20 silent breaks. Required fields collapse to `T` — clean rendering, type system guarantees value.

**Editor tax of required fields.** Editor mid-flight rarely has every value ready — author not chosen, hero image being prepared, SEO copy last. If `required` blocks _saving_, editors lose work or invent placeholders.

**Fix is pairing, not compromise.** Don't water down `required`. Instead:

1. Make every field frontend genuinely needs **`required`**.
2. Turn on **`draft_saving_active: true`** at model level (requires `draft_mode_active: true`). Drafts save with missing required values — publish action still enforces every validator.

Effect: frontend reads only published records, required-on-field + required-at-publish = "every required field present" guarantee, editors save incomplete drafts. See `model-configuration.md` § draft_saving_active.

**When field genuinely _should_ be optional.** Test: "is there sensible record state where this value doesn't exist at all?" `expires_at`, `subtitle` some articles don't have, alternative `secondary_cta` sometimes present — real optionals. "We'll always fill it eventually" = required field with draft workflow.

## Validators worth remembering

Organized by what they let you express, not by `field_type`.

### Constrain string to fixed set — `enum`

```ts
// string field
validators: { enum: { values: ["draft", "review", "published"] } }
appearance: { editor: "string_select", parameters: { options: [
  { label: "Draft", value: "draft" },
  { label: "In review", value: "review" },
  { label: "Published", value: "published" },
]}}
```

Pair `enum` with `string_select` or `string_radio_group` — plain `single_line` doesn't enforce choice in UI. Enum = structural guarantee; dropdown = affordance.

Right shape for **semantic variants** (`tone`, `emphasis`, `severity`) — see `separation-of-concerns.md`.

### Constrain string format — `format` and `length`

```ts
// email
validators: { format: { predefined_pattern: "email" } }

// URL — covers external links, canonical URLs, profile links, etc.
validators: { format: { predefined_pattern: "url" } }

// custom pattern with a human-readable description
validators: {
  format: {
    custom_pattern: "^[A-Z]{2}-\\d{4}$",
    description: "Two uppercase letters, dash, four digits (e.g. AB-1234)",
  },
}
```

`predefined_pattern` accepts `"email"` or `"url"`. Use these before custom regex — maintained by DatoCMS, clean error message without `description`.

`description` matters: without it, editor sees regex as error. With it, plain English.

`length` accepts `min`, `max`, `eq` — ISBN, country codes, fixed length.

### Force uniqueness — `unique`

Available on `string`, `slug`, `link`. Use for natural keys (slug, SKU, internal codename). DatoCMS enforces uniqueness across whole collection — no scoping.

### Constrain numeric/date ranges

```ts
// integer / float
validators: { number_range: { min: 0, max: 100 } }

// date / date_time
validators: { date_range: { min: "2024-01-01" } }
validators: { date_time_range: { min: "2024-01-01T00:00:00Z" } }
```

### Constrain files and images

| Validator | Use for |
| - | - |
| `extension: { predefined_list: 'image' \| 'transformable_image' \| 'video' \| 'document' }` | Restrict by category. **`'transformable_image'` for hero/cover images** — only these support `responsiveImage` transformations. |
| `extension: { extensions: ["pdf", "epub"] }` | Custom allowlist. |
| `image_dimensions: { width_min_value, width_max_value, height_min_value, height_max_value }` | Reject too-small images. |
| `image_aspect_ratio: { eq_ar_numerator: 16, eq_ar_denominator: 9 }` | Force editorial consistency (also `min_*` / `max_*`). |
| `file_size: { max_value: 2, max_unit: "MB" }` | Cap upload size. |
| `required_alt_title: { alt: true }` | Force alt text — wire on every user-facing image field. Accessibility/SEO depend on it. |
| `size: { min, max }` (gallery only) | Limit image count. |

### Constrain links between records

`item_item_type` (link), `items_item_type` (links), `structured_text_links` carry **cascade strategies** — see `../../datocms-cma/references/schema.md` § Reference-cascade strategies. Set allowlist deliberately; default to `"fail"` for editorial content.

### Auto-fill slug from title — `slug_title_field`

```ts
validators: {
  slug_title_field: { title_field_id: titleField.id },
  slug_format: { predefined_pattern: "webpage_slug" },
}
```

Without `slug_title_field`, editors type slug by hand. With it, slug pre-fills from bound title, updates as editor types — until manual edit. Wire on every URL slug.

`slug_format` accepts `predefined_pattern: "webpage_slug"` (lowercase, hyphens, ASCII) or `custom_pattern` regex.

### Require specific SEO sub-fields

```ts
// seo field
validators: {
  required_seo_fields: { title: true, description: true, image: true },
  title_length: { max: 60 },
  description_length: { max: 160 },
}
```

`title_length` / `description_length` show live character counter — Google truncates \~60/160. Wire on every public-facing model's SEO field. SEO field doesn't stand alone: when sub-field empty, CDA's `_seoMetaTags` falls back to model's `title_field` / `image_preview_field` / `excerpt_field` — see `model-configuration.md` § "SEO fallbacks for `_seoMetaTags`".

### Limit Modular Content / Structured Text container

```ts
// rich_text
validators: { rich_text_blocks: { item_types: [...] }, size: { min: 1, max: 30 } }

// structured_text — see schema.md for the three overlapping validators
validators: {
  structured_text_blocks: { item_types: [...] },
  structured_text_inline_blocks: { item_types: [...] },
  structured_text_links: { item_types: [...] },
  length: { max: 5000 }, // character cap for plain-text portion
}
```

`size` on `rich_text`, `length` on `structured_text` keep records under 300 KB / 500-block limits — see `models-vs-blocks.md`.

### Sanitize HTML for `text` fields

```ts
validators: { sanitized_html: { sanitize_before_validation: true } }
```

Use when `text` field stores HTML frontend will render. Without it, editor can paste `<script>` tag and get it back verbatim.

## Appearance — when defaults aren't enough

### Single-editor field types

One built-in editor; only configuration is parameters. Don't reach for `appearance` unless tuning parameter.

| `field_type` | Default editor | Tunable parameters |
| - | - | - |
| `boolean` | `boolean` | none (or `boolean_radio_group`) |
| `color` | `color_picker` | `enable_alpha`, `preset_colors` (brand palette) |
| `date` | `date_picker` | none |
| `date_time` | `date_time_picker` | none |
| `file` | `file` | none |
| `float` / `integer` | `float` / `integer` | `placeholder` |
| `gallery` | `gallery` | none |
| `lat_lon` | `map` | none |
| `link` | `link_select` (or `link_embed`) | see § "Multi-editor" |
| `slug` | `slug` | `url_prefix` (e.g. `https://site.com/blog/`), `placeholder` |
| `video` | `video` | none |

### Multi-editor field types — real choices

#### `boolean`: `boolean` vs `boolean_radio_group`

Default = checkbox-style toggle. Switch to `boolean_radio_group` when **labels matter**:

```ts
appearance: {
  editor: "boolean_radio_group",
  parameters: {
    positive_radio: { label: "Featured on homepage", hint: "Limit 4 active" },
    negative_radio: { label: "Hide from homepage" },
  },
}
```

Toggle "Featured" ambiguous — featured _where_? Radio group with explicit labels removes guess.

#### `string`: `single_line` vs `string_radio_group` vs `string_select`

- `single_line` — free text. Default. `heading: true` = larger input, conventionally for record's title/headline (presentation cue, not validation).
- `string_select` — dropdown. Pair with `enum` (always).
- `string_radio_group` — radios flat. Pair with `enum` when 2-4 options, editors should see all.

#### `text`: `markdown` vs `wysiwyg` vs `textarea`

Three editor experiences. Choice changes what editors can produce.

| Editor | Output | When |
| - | - | - |
| `markdown` (default) | Markdown source | Editors technical; output parsed downstream; predictable output |
| `wysiwyg` | HTML | Non-technical editors; "looks like Word"; HTML output |
| `textarea` | Plain text | Multi-line plain text — meta descriptions, transcripts, alt text — no formatting |

**New structured editorial work: prefer `structured_text`.** Typed AST, embedded blocks, controlled nodes/marks, frontend rendering. `text` for legacy-shaped content (Markdown source, raw HTML) or plain text.

`markdown` / `wysiwyg`: `toolbar` parameter constrains what editors can do — drop `image`, `table` when unwanted.

#### `json`: raw JSON vs multi-select vs checkbox-group

Same `json` field type, three radically different editors:

```ts
// editor: "json" — JSON textarea w/ syntax highlighting. Use for true free-form JSON.

// editor: "string_multi_select" — dropdown of preset options
appearance: {
  editor: "string_multi_select",
  parameters: { options: [
    { label: "Vegetarian", value: "vegetarian" },
    { label: "Gluten-free", value: "gluten_free" },
  ]},
}
// stored as: ["vegetarian", "gluten_free"]

// editor: "string_checkbox_group" — same shape, checkboxes instead
```

`string_multi_select` / `string_checkbox_group` = right shape for **fixed tag set** (dietary flags, badge types, feature toggles). Value = JSON array of strings, queryable on CDA.

Free-form, editor-typed string list not fixed set? Create tag _model_ + `links` field — see `taxonomy-classification.md`.

#### `single_block`: `framed_single_block` vs `frameless_single_block`

Content-reuse decision, not just UI. Frameless = DatoCMS's "shared field set" pattern — see `content-reuse.md` § Pattern 4 (Frameless single_block).

So: **frameless** when block = transparent way to share fields (editor sees block's fields as inline); **framed** when block = meaningful nested entity editor should perceive as unit.

#### `link` / `links`: `*_select` vs `*_embed`

Both = pick / create referenced record. Difference = **preview density**.

- `link_select` / `links_select` — compact chips. Linked record = small tag with title + `x`. Right for high-density many-link fields where editors recognize records by name (tags, technologies, categories).
- `link_embed` / `links_embed` — rich card. Linked record shows presentation image, model name, title, publication status. Right when editor needs visual cue or publication state matters (featured Author, selected Project).

Both offer "Create new…" and "From library" actions, keep linked record as real reference — neither edits upstream inline. Pick by information editor needs to scan.

### `structured_text` editor parameters

Most configurable editor:

```ts
appearance: {
  editor: "structured_text",
  parameters: {
    nodes: ["heading", "list", "link", "blockquote", "code", "thematicBreak"],
    marks: ["strong", "emphasis", "code", "highlight"],
    heading_levels: [2, 3],
    show_links_target_blank: true,
    show_links_meta_editor: false,
    blocks_start_collapsed: false,
  },
}
```

Decisions per field:

- **`nodes`** — block-level node types editors can insert. Constrain aggressively. "Article body" = everything; "Quote attribution" = only `link`.
- **`marks`** — inline formatting. Drop `underline` if design doesn't use it.
- **`heading_levels`** — which `<h2>`–`<h6>` editor can produce. `<h1>` reserved for page; body content = `[2, 3]`.
- **`show_links_target_blank`** — "open in new tab" toggle. Disable if frontend handles target globally.

### `seo` editor parameters

```ts
appearance: {
  editor: "seo",
  parameters: {
    fields: ["title", "description", "image"], // hide twitter_card / no_index if unused
    previews: ["google", "facebook", "twitter"],
  },
}
```

Hide unused sub-fields = declutter editor. Show only previews matching channels you publish (Google + one social) = scannable.

## Cross-cutting field attributes

### `default_value`

Per-type default. Localized fields = locale-keyed object, not bare value:

```ts
// non-localized
default_value: "Untitled"

// localized
default_value: { en: "Untitled", it: "Senza titolo" }
```

Pairs well with required-but-rarely-changed fields (record status, visibility flags).

### `addons`

`appearance.addons` = array of plugin add-ons wrapping editor — translation helpers, AI assist, character counters, validation hints. First-party editor unchanged; addons appear alongside. Most projects don't need; reach for when specific plugin solves recurring editor pain.

### `deep_filtering_enabled`

Flag on `rich_text`, `single_block`, `structured_text`. When `true`, GraphQL CDA exposes filters _inside_ embedded blocks — e.g. "find all pages whose body contains `cta_block` with `tone: 'urgent'`."

**Use when** frontend genuinely needs to query block contents (filtering pages by embedded promo type, "blocks mentioning X" report).

**Skip when** frontend reads block content top-down from parent. Deep filtering adds GraphQL surface, expensive on high-volume models.

## Common mistakes

- **`enum` without `string_select`/`string_radio_group`.** Validator catches at save; UI shows free-text. Pair them.
- **`extension: { predefined_list: 'image' }` for hero images.** Some formats can't be transformed by `responsiveImage`. Use `'transformable_image'`.
- **Skipping `required_alt_title`.** Editors forget alt; accessibility/SEO suffer. Wire on user-facing images.
- **Skipping `slug_title_field` on slugs.** Editors hand-type, slugs drift. Always bind.
- **Skipping `title_length` / `description_length` on SEO.** Editors write truncated copy. Counter prevents.
- **`text` + `wysiwyg` for new editorial.** Prefer `structured_text` — typed, queryable, embeds blocks, configurable. `text` for legacy/plain text.
- **`json` field with raw `json` editor for fixed tag set.** Use `string_multi_select` / `string_checkbox_group` — curated UI, data still JSON array.
- **Defaulting to `link_select` where editors need visual cue.** Compact chips = tag-like fields (lots of short identifiers). Curated picks (featured Author, chosen Project) = `link_embed` shows thumbnail + status.
- **Bare-value `default_value` on localized field.** Silently ignored. Pass locale-keyed object.
