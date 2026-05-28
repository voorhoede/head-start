# Content reuse patterns

DatoCMS 3 reuse primitives: link fields (record→record), Blocks Library (blocks reusable across parents), fieldsets (group fields within model). Each solves diff problem; mixing creates duplication or over-abstraction.

## Contents

- The reuse spectrum
- Pattern 1 — Reusable model + Link fields
- Pattern 2 — Block model in Blocks Library
- Pattern 3 — `seo` field type (canonical SEO pattern)
- Pattern 4 — Frameless single_block ("shared field set")
- Pattern 5 — Tree-model taxonomies
- Pattern 6 — Fieldsets for grouping
- Block-library hygiene anti-patterns

## The reuse spectrum

```
Full duplication ←———————————————————————→ Full reference
(copy fields per model)                     (link to one source)

   fields           single_block          link / links
  duplicated         block model           to a model
  per model        in Blocks Library
```

Most decisions sit middle. Choice depends on **edit propagation** (editing one place update others?) and **lifecycle independence** (content exist on its own?).

## Pattern 1 — Reusable model + Link fields

Canonical "shared" pattern. Use when same content appears multiple places, edits propagate.

```
Author model (standalone records, one per author)
  ├── name
  ├── bio
  └── photo

Article model
  └── author    (link → Author)

Article model B
  └── authors   (links → [Author])
```

**Use for:** authors, products, categories/tags, canonical CTAs, locations, team members—anything with own page or admin lifecycle.

Cascade-strategy fields on link validators decide what happens when upstream record unpublished or deleted while referrer published—pick deliberately. See `../../datocms-cma/references/schema.md` for cascade detail.

## Pattern 2 — Block model in Blocks Library

Block model defined once, used across many parent models via `single_block`, `rich_text` (Modular Content), or `structured_text` fields. Each _use_ = independent instance—no edit propagation across parents.

```
Block model: callout_block
  ├── tone (enum: neutral / warning / success)
  ├── heading
  └── body

Page model.body            (rich_text, allows callout_block)
Article model.content      (structured_text, allows callout_block block-level)
Landing model.sections     (rich_text, allows callout_block)
```

**Use for:** structural shapes appearing all over project but each instance its own snapshot—heroes, callouts, image galleries, FAQ blocks, testimonial cards, code samples.

When _same content_ (not just shape) needs appearing multiple places, use Pattern 1.

## Pattern 3 — `seo` field type (canonical SEO pattern)

DatoCMS built-in `seo` field type covers title, description, image, twitter card, etc. Right answer for per-record SEO metadata. Don't roll your own.

```ts
fields.create(modelId, {
  api_key: "seo",
  field_type: "seo",
});
```

For project-wide global SEO (default OG image, sitewide twitter handle, etc.), use `singleton: true` "Site settings" model with `seo` and other fields directly. See `model-configuration.md` § singleton for lifecycle, `field-configuration.md` § "Require specific SEO sub-fields" for `required_seo_fields` / `title_length` / `description_length`.

## Pattern 4 — Frameless single_block ("shared field set")

DatoCMS no "spread shared fields" primitive like other CMSes. DatoCMS-native equivalent = **block model in required, frameless `single_block` field**—"frameless single block" pattern. Canonical answer when multiple models need same subset of fields, want them appearing _as if native fields_ in each model.

### When to use it

Several models share meaningful subset of fields, want:

- one source of truth for shape (add field once, every consumer gets it)
- editor experience feeling like fields belong to parent model (no extra "open this block" click)
- per-record values (each consumer record has own values; not edit-propagation reuse—that's Pattern 1)

Classic example: "Bloggable" shape (title, subtitle, author, tags, hero image) shared across `BlogPost`, `NewsArticle`, `ProductReview`, each adding model-specific fields (`body`, `summary`, `rating`). Note publish date not field—lives on `record.meta.published_at` (see `separation-of-concerns.md` § "Don't recreate built-in record meta").

### How it works

1. Create block model with shared fields. Name for _role_ (`bloggable_block`, `cardable_block`, `geolocated_block`), not for one consumer.
2. On each consumer model, add `single_block` field:
   - allows **only** that block model
   - has **required** validation active
   - uses **Frameless** presentation mode (set `appearance.editor: "frameless_single_block"`—see `field-configuration.md` § single_block)

Frameless presentation hides Modular Content frame in editor—block's fields render inline as if defined directly on consumer model. From editor POV, `title`, `author`, `tags`, etc. are fields of `BlogPost`. From schema POV, they live in one place.

```
Block model: bloggable_block
  ├── title
  ├── subtitle    (string, optional)
  ├── author      (link → Author)
  ├── tags        (links → [Tag])
  └── hero_image  (file)

BlogPost
  ├── shared       (single_block → bloggable_block, required, frameless)
  └── body         (structured_text)

NewsArticle
  ├── shared       (single_block → bloggable_block, required, frameless)
  └── summary      (text)

ProductReview
  ├── shared       (single_block → bloggable_block, required, frameless)
  └── rating       (integer)
```

### Trade-offs

- **Querying** — shared fields live one level deep (`blogPost.shared.title`). GraphQL fragments make manageable; see `datocms-cda` for fragment patterns.
- **Renaming** — adding/removing field on shared block updates every consumer at once. Point, but also means schema changes have wider blast radius. Treat shared block like shared library.
- **Not reuse-of-content, reuse-of-shape.** Each consumer record holds own values. Want editing one place update many? Wrong pattern—use model + Link (Pattern 1).
- **Don't combine with non-required or non-frameless.** If field not required, editors see "add the shared block" button—illusion breaks. If not frameless, editors see wrapper frame around fields.

## Pattern 5 — Tree-model taxonomies

Hierarchical classification (Electronics > Phones > Smartphones)? Use model with `tree: true`. DatoCMS gives parent/child and sortable position—no need to model `parent` as self-reference manually.

See `taxonomy-classification.md` for full taxonomy guide, `model-configuration.md` § Behaviour — ordering for how `tree` interacts with `sortable` / `ordering_field` / `ordering_meta`.

## Pattern 6 — Fieldsets for grouping

Fieldsets group fields **visually** within one model. Don't reuse content—organize long form into editor-friendly sections.

```
Article model
  ├── fieldset: "Content"
  │     ├── title
  │     ├── slug
  │     └── body
  ├── fieldset: "SEO"
  │     └── seo
  └── fieldset: "Publishing"
        ├── published_at
        └── author
```

Use fieldsets to ease editor cognitive load, not reuse mechanism. Same fieldset structure can't be "shared" across models—wanting that? Want frameless single-block pattern (Pattern 4).

## Block-library hygiene anti-patterns

Blocks Library is project-level, accretes. First hygiene move: naming convention—every block model `api_key` ends with `_block` (see `models-vs-blocks.md` § "Naming convention"). Rest assumes baseline. Watch for:

- **Single-use blocks.** Block model used in exactly one parent's one field. Almost no value in indirection—fields could live on parent directly. Inline, or note block intentionally page-shaped (e.g. complex hero only homepage uses).
- **Blocks duplicating native Structured Text nodes.** `quote_block`, `code_block`, `list_block`, `divider_block` recreates `blockquote`, `code`, `list`, `thematicBreak`—Structured Text produces those natively. Allow node in field's `nodes` parameter, delete block. See `block-fields-and-structured-text.md` § Anti-patterns.
- **Near-duplicate blocks.** `hero_blue_block`, `hero_yellow_block`, `hero_red_block`, `hero_v1_block`, `hero_v2_block`. Collapse to one block with `tone` / `variant` enum field. Frontend maps variant to design.
- **Page-shaped block names.** `homepage_hero_block`, `pricing_page_cta_block`, `blog_index_header_block`. Block can't be reused on other pages even when shape fits. Rename to _role_ (`hero_block`, `cta_block`, `index_header_block`), let frontend customize per page.
- **God blocks.** `section_block` with 40 optional fields covering every variant site ever needed. Editor UX collapses, validation can't enforce which fields belong with which variant. Split into focused blocks (`text_section_block`, `media_section_block`, `feature_grid_section_block`).
- **Blocks better as models.** Same conceptual content appears as block in many parents, editors keep asking _"can we reuse the same one?"_—they want model + Link, not block. See `models-vs-blocks.md`.

### Signs of over-abstraction in other direction

Not everything needs reusable.

- Model with three records, all only ever linked from one parent each, editors complain navigating between records to edit one logical thing → should probably be block.
- Block extracted "just in case gets reused later" then never reused → inline it.
- Complex hybrid (link + override block + override fields on parent) for content existing only one place → simplify.

When in doubt: **start simple, promote later**. Easier extracting block model from inlined fields than inlining block model used in 30 records.
