# Separation of Content and Presentation

Key principle: **separate what content IS from how it LOOKS**. Schema encoding design = debt when design changes.

## Contents

- The problem
- The principle
- The redesign test
- DatoCMS implementation
- Don't recreate built-in record meta
- Don't recreate file/gallery metadata either
- Don't recreate `position` either — use model ordering
- Hints — the schema's running commentary
- The same trap, applied to blocks

## The problem

Content tied to presentation = bad:

- Redesigns need content migration, not just CSS.
- Content can't reuse across channels (web, mobile, voice, email).
- Editors make design choices, not content choices.
- A/B testing and variants need duplicate content.

## The principle

Model content by **meaning and purpose**, not looks. Frontend handles presentation; schema handles what content _is_.

### Bad: presentation-focused

```
big_hero_text       → what if we want small heroes?
red_button          → what if brand colors change?
three_column_layout → what about mobile (one column)?
left_sidebar        → position is a frontend concern
mobile_image        → device-specific content is fragile
```

### Good: meaning-focused

```
headline           → the main message (render however)
call_to_action     → an action we want users to take
features           → a list of things (columns decided by frontend)
related_content    → a relationship (positioned by context)
image              → one image with responsive crops
```

## The redesign test

Ask: _"If we redesigned the site tomorrow, would these field names still make sense?"_

- `three_column_features` → ❌ fails (what if 2 columns next year?)
- `features` → ✅ works (describes purpose: list of product features)
- `blue_highlight_box` → ❌ fails (what if we go purple?)
- `callout` → ✅ works (describes role: attention-grabbing aside)

If "we'd rename the field," it's presentation-shaped.

## DatoCMS implementation

Use `api_key` values describing content's role, not visual treatment. When variants matter, encode as enum-validated strings frontend interprets.

```ts
// ❌ presentation in field names
fields.create(modelId, { api_key: "big_hero_text", field_type: "string" });
fields.create(modelId, { api_key: "font_size",     field_type: "integer" });
fields.create(modelId, { api_key: "background_color", field_type: "color" });

// ✅ meaning in field names; variant as data, not as type
fields.create(modelId, { api_key: "headline", field_type: "string" });
fields.create(modelId, {
  api_key: "emphasis",
  field_type: "string",
  validators: { enum: { values: ["standard", "prominent"] } },
});
fields.create(modelId, {
  api_key: "tone",
  field_type: "string",
  validators: { enum: { values: ["neutral", "warning", "success"] } },
});
```

Frontend maps `tone: "warning"` to current visual style. Content stays semantic across redesigns.

For validator + appearance pairing making enum show as real dropdown, see `field-configuration.md` § "Constrain a string to a fixed set of values — enum".

## Don't recreate built-in record meta

Every DatoCMS record exposes `meta` object with fields existing on all models. **Don't add custom fields with these names** — two parallel truths drift when editor edits one but not other.

| Built-in (on `record.meta`) | What it is | Editor-editable? |
| - | - | - |
| `created_at` | Timestamp record first created | ✅ yes, like regular field |
| `updated_at` | Timestamp of last update | ✅ yes |
| `published_at` | Timestamp of most recent publication | ✅ yes |
| `first_published_at` | Timestamp of first-ever publication | ✅ yes |
| `publication_scheduled_at` | Timestamp of future scheduled publication | ✅ yes |
| `status` | `'draft' \| 'updated' \| 'published'` | derived |
| `is_valid` | Whether record passes its validators | derived |

Common anti-pattern:

```ts
// ❌ Don't do this — duplicates record.meta.published_at
fields.create(modelId, {
  api_key: "published_at",
  field_type: "date_time",
  label: "Publication date",
});

// ✅ Just read record.meta.published_at on the frontend.
// If the editor needs to backdate, they can edit it directly in the admin —
// the meta timestamps are user-editable.
```

In GraphQL, meta fields are `_createdAt`, `_updatedAt`, `_publishedAt`, `_firstPublishedAt`, `_publicationScheduledAt`, `_status`. If domain concept differs from "when published" (e.g., `event_date` on event model, or `effective_from` on pricing rule), that's a real field — test: can value change independently of publication lifecycle?

## Don't recreate file/gallery metadata either

Same trap, applied to uploads. Every asset has `alt`, `title`, `custom_data` (arbitrary JSON), and (for images) `focal_point` — all per-locale. Key insight: these exist at **two levels**, either enough to avoid sibling fields:

| Level | Where | Use for |
| - | - | - |
| **Upload-level default** | Set on upload in Media Area (`default_field_metadata`) | Asset's "true" alt/title traveling with it everywhere. CDA serves as fallback when no per-record override. |
| **Per-record override** | Set on `file` / `gallery` field of specific record (asset selector exposes same fields) | When _this record_ needs different alt or title than upload's default — hero image alt referencing article's headline, product photo title mentioning variant. |

**No third "in-record-but-not-on-the-upload" case** justifies sibling field. Whether editor wants global or per-record value, answer: fill metadata on upload or on field — never `image_alt`, `image_title`, `image_label`, `image_caption` as separate fields.

Common anti-patterns:

```ts
// ❌ Don't do this — duplicates the asset's built-in metadata
fields.create(modelId, { api_key: "image_alt",     field_type: "string" });
fields.create(modelId, { api_key: "image_title",   field_type: "string" });
fields.create(modelId, { api_key: "image_label",   field_type: "string" });
fields.create(modelId, { api_key: "image_caption", field_type: "string" });

// ✅ Use the file/gallery field's own metadata. For a per-locale
//    record-level alt/title, the editor edits it right inside the
//    asset selector. Force editors to fill alt with
//    required_alt_title — see field-configuration.md § "Constrain
//    files and images".
fields.create(modelId, {
  api_key: "hero_image",
  field_type: "file",
  validators: { required_alt_title: { alt: true } },
});

// ✅ For free-form record-specific data on the asset (e.g. a
//    "display variant" the frontend reads), use custom_data on the
//    file field — still no extra field needed.
```

In GraphQL, asset metadata exposed on upload (`hero.alt`, `hero.title`, `hero.customData`, `hero.focalPoint`), CDA auto-resolves per-record override over upload-level default. `responsiveImage` helpers pick `alt` and `title` through same chain.

Same logic applies to upload-level attributes in Media Area (`copyright`, `author`, `notes`, `tags`, `upload_collection`). Don't recreate as fields — already there.

## Don't recreate `position` either — use model ordering

Same trap, different field. To order records in list, **don't add `position` integer field**. Model owns ordering:

| What you want | Model attribute | Editor experience |
| - | - | - |
| Editors drag records into curated order | `sortable: true` | Drag-and-drop handle in collection |
| Hierarchical parent → children with order inside each level | `tree: true` | Drag-and-drop with indenting; `parent` and `position` managed for you |
| Automatic order by domain field (e.g. `priority`, `event_date`) | `ordering_field: { id, type: "field" }` + `ordering_direction` | Records sort automatically |
| Automatic order by meta timestamp | `ordering_meta: 'created_at' \| 'updated_at' \| 'first_published_at' \| 'published_at'` + `ordering_direction` | Pure chronological feeds |

Four strategies mutually exclusive — pick one. See `model-configuration.md` § Behaviour — ordering for full decision shortcuts and constraints on block models.

## Hints — the schema's running commentary

Field name says what field _is_. Hint says what editor should _do_ with it. Names constrained by `api_key` rules and brevity; hints free-form, live under field in record form. Use them.

**Rule: always add hint unless field genuinely obvious.** "Title" doesn't need hint. Almost everything else does. Cost of hint: one string; cost of confused editor guessing: forever.

### Where hints live

DatoCMS supports hints in three places — same `hint` string, rendered in editor UI under relevant element:

| On | Use for |
| - | - |
| `field.hint` | What field is for, what format value should take, why might be required, examples of good values |
| `fieldset.hint` | Why fields grouped together; what context whole section serves |
| `item_type.hint` | What model represents in project, when editor should reach for it instead of similar-looking model |

### What to write

Good hints answer questions editor would otherwise ask in Slack:

- **Format and constraints.** "Used in URL — keep lowercase, use hyphens, no special characters." (Slug.)
- **Where value shows up.** "Appears as page's `<title>` and in social shares." (SEO title.)
- **Decision guidance.** "Choose 'Featured' to surface article on homepage carousel — limit 4 active at a time."
- **Format examples.** "e.g. `2026-04-30T14:00:00+02:00`."
- **Cross-references.** "Editing this updates every product card on site. To override copy on specific page, use page-specific override block instead."
- **Why it's required.** "Required because public site falls back to this when no per-locale value set."

### What _not_ to write

- **Don't restate field name.** "Title of article" under field called "Title" = noise.
- **Don't write hints that rot.** "Used by homepage hero on marketing.example.com (added Q3 2024)" — hint outlives context. Describe _purpose_, not current usage.
- **Don't use hints as documentation.** Multi-paragraph hint = field doing too much, or deeper concept model hint should explain instead.
- **Don't put validation rules in hints when validator enforces them.** Validator's error message is where editors see "must be at least 10 characters" — duplicating in hint = noise unless adds _why_.

### Apply consistently when scripting bulk model creation

When migrations or scripts create many fields at once, tempting to ship without hints and "add later." Later doesn't come. Add hint at create time — even thin one — because field's purpose freshest in schema author's mind right then.

Same applies to model and fieldset hints: write while designing, not as retroactive cleanup.

## The same trap, applied to blocks

Block model names suffer same problem more visibly because they end up in project's Blocks Library where editors see them.

- `homepage_hero_block` → ❌ ties block to page
- `hero_block` → ✅ hero is hero on any page
- `three_card_grid_block` → ❌ layout description, not content shape
- `card_grid_block` (with `cards` array) → ✅ frontend chooses 2/3/4 columns
- `blue_callout_block`, `yellow_callout_block`, `red_callout_block` → ❌ three near-duplicate blocks
- one `callout_block` with `tone` enum → ✅ one shape, frontend maps tone → color

(All block `api_key`s in examples carry `_block` suffix — see `models-vs-blocks.md` § "Naming convention" for why.)

See `content-reuse.md` for more on block-library hygiene.
