# Block-bearing fields and Structured Text

Once you've decided something is a block (see `models-vs-blocks.md`), the next question is _which container holds it_. DatoCMS has three, and the choice shapes editing UX, query shape, and how the content scales with locales.

## Picking the container

| Field type | Shape | Use when |
| - | - | - |
| `single_block` | Exactly one block (or `null`) | Fixed slot: hero, SEO block, address. Shape known. Singular. |
| `rich_text` (Modular Content) | Ordered list of blocks, no prose between | Page-builder. Sections from fixed palette. No free text. |
| `structured_text` | Prose tree (DAST) with blocks interleaved | Long-form writing. Blocks inside prose. Articles, docs. |

### Decision shortcuts

**No prose? → `rich_text`.** Landing pages, page builders, dashboards. Stacking sections, not writing paragraphs.

**Prose with embedded structured pieces? → `structured_text`.** Articles, blog posts, docs, knowledge base.

**Exactly one of something? → `single_block`.** SEO, hero, address. Not 1-element `rich_text` — `single_block` queries simpler. Sharing field set across models? Use required + frameless variant — see `content-reuse.md` § Pattern 4 and `field-configuration.md` § single_block.

### Anti-patterns

**Modular Content for prose.** "Paragraph block" with single text field = Structured Text in disguise. Use `structured_text` for real prose UX.

**Structured Text as page builder.** Page sections not prose — no narrative. Use `rich_text`.

**`rich_text` with one block type as poor `single_block`.** "Add block" UI produces one thing. Query handles 0-or-1 array. Use `single_block`.

**Blocks recreating native DAST nodes.** Structured Text already has `blockquote`, `code` (with language, highlight_lines), `list` / `listItem`, `heading`, `thematicBreak`, `link`. No need for `quote_block`, `code_block`, `list_block`, `heading_block`, `divider_block`, `link_block`. Duplicates editor toolbar, eats 500-block budget, two render paths. Use native via editor `nodes` parameter. Block models for _non-native_ shapes DAST doesn't cover — images, galleries, callouts with `tone` enum, embeds. See DAST cheatsheet below.

**Image/gallery/video blocks with `caption` (or `image_alt` / `image_credit` / `image_label`) sibling fields.** Asset metadata already covers it — `alt`, `title`, `custom_data`, `focal_point` per-locale on every `file` / `gallery`, upload-level + per-record. Caption → `title` (short) or `custom_data` (rich). Image block = `file` field, optional layout enum (`tone`/`size`/`alignment`); never `file` + `caption` string. See `separation-of-concerns.md` § Don't recreate file/gallery metadata.

## Validators come in three flavors

`structured_text` field has **three separate** allowlists. Not implied:

- `structured_text_blocks` — which block models as block-level (`type: "block"`) nodes.
- `structured_text_inline_blocks` — which block models as inline (`type: "inlineBlock"`) nodes.
- `structured_text_links` — which models as `itemLink` / `inlineItem` nodes (cascade-strategy fields live here).

`structured_text_blocks` does **not** authorize inline blocks or record links. Wire each. "No embedded blocks" → `[]` not omit.

Full validator shapes and cascade-strategy: `../../datocms-cma/references/schema.md`. Editor parameters (`nodes` / `marks` / `heading_levels`): `field-configuration.md` § structured_text editor parameters.

## DAST node cheatsheet

Modeling-relevant subset only. Full grammar (children rules, marks list, building/editing DAST): `../../datocms-cma/references/editing-records.md` § DAST grammar.

| Node | Role | Where it can live |
| - | - | - |
| `block` | Embedded **block-level** record | Direct child of `root` only — never inside paragraph |
| `inlineBlock` | Embedded **inline** record (badge, equation, mid-flow widget) | Inside `paragraph` and `heading` |
| `itemLink` | Hyperlink to DatoCMS record, with inner text | Inside `paragraph` and `heading` |
| `inlineItem` | Reference to record, **no inner text** — frontend renders (chip, mention, auto-title link) | Inside `paragraph` and `heading` |
| `link` | Plain external hyperlink with optional `meta` (`rel`, `target`, etc.) | Inside `paragraph` and `heading` |
| `span` | Leaf text node, with optional `marks` | Inside `paragraph`, `heading`, `link`, `itemLink` |
| `marks` on span | `strong`, `emphasis`, `code`, `underline`, `strikethrough`, `highlight` | — |

### The two pairs that get confused

**`block` vs `inlineBlock`** — same idea (embedded block record), different layout.

- `block` = block-level. Between paragraphs at root, like `<aside>` or `<figure>`. Enter, drop block, enter, write.
- `inlineBlock` = inside prose. Equations, mentions, badges, widgets — flows with text.

"Quote between paragraphs" → `block`. "Stock ticker mid-sentence" → `inlineBlock`.

**`itemLink` vs `inlineItem`** — both point at record, one has inner text.

- `itemLink` = `<a href>`-shaped link to record — _author_ writes link text. Use when author controls link text ("see \[our Q3 earnings post]").
- `inlineItem` = record reference, no inner content — _frontend_ decides render (title? chip? hovercard?). Use when rendering adapts to target state, or surface non-textual.

Editors say "click here" or "this article" → `itemLink`. Rendering reflects target's current title/visual → `inlineItem`.

## Container choice and the limits

Block-bearing fields bounded by per-record limits (size, block count, nesting depth) — see `models-vs-blocks.md` § Hard limits, locale multiplier for numbers, mitigations.

Container choice effects:

- **Localized prose, shared structure.** Structure same across locales, only prose differs → localize `structured_text` for prose, non-localized siblings for structural blocks. Drops block count vs localizing whole `rich_text` page builder.
- **Single block vs one-element rich_text.** `single_block` = one block. `rich_text` `max_items: 1` = array ≤ 1 — same shape, more block budget weight, worse UX. Pick `single_block` for "exactly one."
- **Audit blocks for over-decomposition.** `spacer_block`, `divider_block`, `callout_block` with one text field — each paid from 500 budget. Consolidate before limit increases.
