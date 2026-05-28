---
name: datocms-content-modeling
description: >-
  Decision frameworks for DatoCMS content modeling — schema shape, field
  choice, content reuse, taxonomies, content vs presentation, admin UI
  organization. Use for modeling *decisions*, not implementation: model vs
  block; single_block vs Modular Content vs Structured Text; references vs
  embedded blocks; taxonomy shape (flat/tree/faceted); refactoring page-shaped
  schemas to reusable content; fitting 300 KB / 500-block / 5-level record
  limits; model behaviour (singleton, draft mode, all_locales_required,
  sortable/tree/ordering_field, presentation_title_field,
  collection_appearance, inverse_relationships_enabled); field config
  (validator + appearance — enum + string_select, slug auto-fill,
  required_alt_title, structured_text allowlists, framed vs frameless
  single_block). Also schema review (reuse, editor ergonomics, omnichannel).
  *Creating* schema → `datocms-cli` or `datocms-cma`. Query/render →
  `datocms-cda` + `datocms-frontend-integrations`. Validators + cascade:
  `datocms-cma/references/schema.md`.
---

# DatoCMS Content Modeling

Principles for designing structured content in DatoCMS that's reusable, editor-friendly, and survives redesigns. This skill answers _"how should I model X?"_ — not _"how do I create the model?"_.

## When to apply

- New project content model layout
- Model vs block decisions
- Choosing `single_block`, `rich_text`, `structured_text` for block fields
- Reusable model link vs embedded block
- Taxonomy design: categories, tags, hierarchies, facets
- Refactor page-shaped, redesign-fragile, duplication-heavy schemas
- Diagnose record-size/block-count/nesting-depth limits; design around locale-multiplied block volume
- Admin UI organization: Content tab menu (editors), Schema tab menu (devs), saved views via `item_type_filter`
- Model behavior/presentation config: singleton, sortable, tree, draft-mode, all-locales-required; `presentation_title_field` vs `title_field`; `collection_appearance`; ordering
- Field config: validators, `appearance` choices (`string_select`+`enum`, `framed` vs `frameless` `single_block`, `link_select` vs `link_embed`); editor parameters (slug auto-fill, `structured_text` nodes/marks, SEO previews, `required_alt_title`)

## Core principles

1. **Content is data, not pages.** Structure for meaning, not presentation.
2. **Single source of truth.** Avoid content duplication.
3. **Don't recreate built-ins.** Record meta (`created_at`, `published_at`, …), asset meta (`alt`, `title`, `custom_data`, `focal_point`), and ordering (`position`) all exist already — never add sibling fields, on records or blocks. See `references/separation-of-concerns.md` and `references/model-configuration.md` § Behaviour — ordering.
4. **Future-proof.** Design for unknown channels and redesigns.
5. **Editor-centric.** Optimize for editors, not developers. **Always add hints** to fields, fieldsets, models unless obvious — schema is editor UI. See `references/separation-of-concerns.md` § Hints.

## Routing

Once modeling decision made:

- **Implementation** — `datocms-cli` (migrations, default) or `datocms-cma` (user opts out of migrations / wants immediate schema mutation).
- **Querying / rendering** — `datocms-cda` for GraphQL reads and Structured Text query fragments; `datocms-frontend-integrations` for framework rendering.
- **Validator and cascade-strategy mechanics** — `datocms-cma/references/schema.md` (link/structured-text validators, `on_reference_delete_strategy`, etc.).
- **Building or editing actual DAST tree** — `datocms-cma/references/editing-records.md` (full DAST grammar, dastdown round-trip, typed guards).

## References

**Mandatory** — never propose models, blocks, or fields from memory. Before any structured question or schema suggestion, load every reference whose decision is in scope.

Match decision → file:

- `references/separation-of-concerns.md` — naming/shaping for meaning, not appearance; redesign test; record-meta + file/gallery-meta + position duplication anti-patterns.
- `references/models-vs-blocks.md` — model vs block; structural rules (no orphans, no link-field references, locale inheritance); per-record limits (300 KB / 500 blocks / 5 levels); locale multiplier.
- `references/block-fields-and-structured-text.md` — `single_block` vs `rich_text` (Modular Content) vs `structured_text`; inline-vs-block-vs-itemLink-vs-inlineItem matrix; DAST cheatsheet; **native nodes (`blockquote`, `code`, `list`, `heading`, `thematicBreak`, `link`) — never recreate as blocks**; image/gallery/video block shape (no `caption` sibling); container-shape effects on limits.
- `references/content-reuse.md` — link fields, project-level Blocks Library, built-in `seo`, frameless single-block, tree taxonomies, fieldset grouping, block-library hygiene.
- `references/taxonomy-classification.md` — flat tags, tree models, faceted classification via multiple links, cascade strategies.
- `references/ui-organization.md` — Content tab `menu_item` (editors), Schema tab `schema_menu_item` (devs), saved views via `item_type_filter`, emoji conventions, IA heuristics.
- `references/model-configuration.md` — singleton, draft mode, `all_locales_required`, sortable/tree/ordering, `inverse_relationships_enabled`, `presentation_title_field`, `presentation_image_field`, `collection_appearance`, CDA SEO fallbacks; create-then-wire mechanic.
- `references/field-configuration.md` — validators (enum, format, length, unique, `slug_title_field`, `required_alt_title`, `required_seo_fields`, `transformable_image`, dimensions, structured-text size); `appearance` editors (`string_select`+enum, markdown/wysiwyg/textarea, framed vs frameless `single_block`, `link_select` vs `link_embed`, structured_text nodes/marks/heading_levels, SEO previews, slug `url_prefix`, color presets).
