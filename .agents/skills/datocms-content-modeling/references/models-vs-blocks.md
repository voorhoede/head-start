# Models vs Blocks

DatoCMS core choice: model (record exists alone) or block (fragment inside parent). Right choice = reuse, lifecycle, limits work. Wrong choice = fight platform.

## Contents

- The three decision questions
- Structural rules that constrain the choice
- Hard limits — they force the model decision
- Naming convention: suffix block model `api_key`s with `_block`
- Quick examples
- Reusable across pages: model or block?
- The hybrid: link + override
- Common mistakes

## The three decision questions

DatoCMS rules, apply in order:

1. **Reference from outside record?** → yes = **model**.
2. **Standalone value or only-in-parent?** → standalone = **model**, only-in-parent = **block**.
3. **Parent deleted: keep content or delete with it?** → delete-with = **block**, keep = **model**.

Questions disagree? #1 wins. Links need models. Blocks can't be Link targets.

## Structural rules that constrain the choice

Platform rules, not preferences. Follow early, avoid dead-ends.

- **Blocks live inside fields only.** `single_block`, `rich_text`, `structured_text`. No "list blocks" page, no `client.items.find(blockId)`.
- **Blocks don't count toward record limit.** Blocks right for content that inflates counts (dozens of sections per page).
- **Blocks can't be link targets.** Link `item_item_type` / `items_item_type` accept models only. Need pointing? = model.
- **Delete parent = delete blocks.** No orphan blocks. Content outlives parent? = model.
- **Block fields not localized at block level.** Localization one level up: containing field `localized: true`. Each locale has own blocks. See `block-fields-and-structured-text.md`.
- **Block models = subset of model flags.** `sortable`, `tree`, `draft_mode_active`, `draft_saving_active`, `singleton`, `inverse_relationships_enabled` must be `false`. API enforces. Need flags? = model. See `model-configuration.md` § Behaviour.

## Hard limits — they force the model decision

Block fields bounded per-record. Content compounds? Limits push to models.

| Limit | Default | Notes |
| - | - | - |
| Max record size | **300 KB** | Nested blocks count. Links/assets don't. Higher on some plans. |
| Max blocks per record | **500** | All block fields, all nesting. |
| Max nested depth | **5 levels** | Block in block in block... 5 deep. |

Near limit? **Smell**. Fix: promote blocks to linked models. Links don't count toward host size/block budget.

### The locale multiplier

Block fields localized at _containing field_. `rich_text` with `localized: true` = separate block list per locale.

```
total blocks counted toward the 500/record cap
  = sum over (each locale × each block-bearing field × blocks in that locale)
```

Worst: long page, many `rich_text` fields, dozens of blocks, 6+ locales. Math explodes. Heavy locales + page-builder = limit blown.

### Mitigations (best first)

First three = model-vs-block reframes. Blocks → linked models.

1. **Move repeating compositions to linked records.** `rich_text` with 50 sections → `Section` model, link to list. Links don't count toward budget.
2. **Promote page to parent + children.** `Page` record with `links` to `PageSection` records. Each section has own localized fields. Scoped edits, per-section limits.
3. **Localize coarser.** Only prose needs locale, not whole composition. Localized `structured_text` + non-localized structural blocks = drop multiplier. See `block-fields-and-structured-text.md`.
4. **Audit over-decomposition.** `callout_block` (one text), `spacer_block`, `divider_block` — each costs 500 budget. Consolidate. See `content-reuse.md`.

### Diagnosing existing limit failures

Record fails save with size/block error? Ask: _which field, which locale worst?_ Mitigation targets that one locale × field, not whole schema.

## Naming convention: suffix block model `api_key`s with `_block`

Simple rule, pays daily: **block `api_key` ends with `_block`**. `hero_block`, `callout_block`, `image_gallery_block`, `featured_product_block`. Display names don't need suffix — only `api_key`.

Why:

- **Visual distinction in Blocks Library + GraphQL.** Editors see blocks; devs read `HeroBlockRecord` = embedded, not standalone.
- **No collisions with model `api_key`s.** `hero` (block) + `hero` (model) collide. Suffix blocks, reserve bare for models.
- **Clean Structured Text validators.** `structured_text_blocks: { item_types: [...] }` with `*_block` only = self-documenting.
- **Project consistency.** New blocks follow rule, no judgement.

Applies to _all_ block models — shared frameless blocks (`bloggable_block`, `cardable_block`) and single-use. Only unsuffixed blocks here = old negative examples.

## Quick examples

| Content | Model/block | Why |
| - | - | - |
| Author profile | model | Reused, standalone, survives article |
| Product | model | Linked many places, own page, lifecycle independent |
| Category | model | Referenced, taxonomy lives alone |
| Hero on landing | block | Page-only, no sense outside, deleted with page |
| Gallery on project | block | Project-specific; each has own |
| Quote mid-article | block | Inline in prose, no independent value |
| Reusable testimonial | model (or block) | Same testimonial many places, edits propagate = model. Each page snapshot = block. |
| SEO metadata | built-in `seo` | Use field type, don't roll own |
| Store address | depends | One store → fields on model. Reusable shape → block in `single_block` |

## Reusable across pages: model or block?

Teams hesitate here. Deciding question: **edit propagation**, not looks:

- _"Edit once, update everywhere?"_ → model + Link. One source, propagates.
- _"Each page own copy, drifts?"_ → block. Snapshot, no propagation.

Examples:

- **Authors** → model. Bio updates across articles.
- **Testimonials verbatim many pages** → model. Edit quote, updates everywhere.
- **CTAs** → model = small canonical library, curated. Block = each page composes own.
- **Product cards on landing** → almost always model link. Product owns name/price/image; page references. (Overrides? Use hybrid below.)

## The hybrid: link + override

Content reusable, but context needs tweak: link to canonical model + override fields in block.

```
block model: featured_product_block
  ├── product            (link → product model)
  ├── override_title     (string, optional)
  └── override_blurb     (text, optional)
```

Frontend: `coalesce(override_title, product.title)`. Product canonical; tweak local. See `datocms-cda` for queries.

## Common mistakes

- **Reusable as block** "editor sees on page." Result: edits don't propagate, library fills with near-duplicates.
- **Page-specific as model** "feel reusable later." Result: model used once, extra Link field, editor navigates two records for one page.
- **Forcing tree/sortable/singleton on block.** API rejects. Need flags? = model. See `model-configuration.md`.
- **Reference block from another record.** Blocks not link targets. Need pointing? Promote to model.
