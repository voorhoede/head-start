# Taxonomy and classification

Taxonomies organize content for filtering, navigation, relationships. DatoCMS gives native primitives for three classification shapes covering almost every case — flat tags, hierarchical trees, faceted classification.

## Contents

- The three shapes
- Design principles
- Cascade strategies on taxonomy links
- Querying taxonomies
- Common mistakes

## The three shapes

### Flat taxonomy

Simple term list, no hierarchy. Terms interchangeable peers; item can have many.

**Use for:** blog tags, content topics, simple flag-like categories.

```
Tag model (standalone records)
  ├── label
  └── slug

Article.tags    (links → [Tag])
```

### Hierarchical taxonomy — use a tree model

Terms with parent-child relationships. **Use DatoCMS's built-in `tree: true` flag** — don't roll your own `parent` self-reference. Tree model gives parent/child wiring and sortable position out of the box, plus editor UI that understands hierarchy.

**Use for:** product categories, content sections, documentation chapters, anything with "X is a kind of Y".

```
Category model (tree: true)
  ├── label
  └── slug

Product.category   (link → Category)
```

Tree managed in DatoCMS UI as actual tree — drag-and-drop reordering, indenting, collapsing. `parent_id` and `position` first-class on tree records. For how `tree: true` relates to other ordering strategies (`sortable`, `ordering_field`, `ordering_meta`) and why they're mutually exclusive, see `model-configuration.md` § Behaviour — ordering.

**Self-referencing models without `tree: true` are an anti-pattern** when intent is hierarchy. Editor UX much worse, position isn't tracked, reinventing what platform already provides. Only do manually when hierarchy isn't really hierarchy (e.g. "see also" graph using same model).

### Faceted classification

Multiple **independent** dimensions, filtering combines them (`color: red AND size: medium AND price < 50`). Each dimension is own taxonomy model; consumer has one Link field per dimension.

**Use for:** e-commerce filters, complex catalog navigation, anything where users combine filters.

```
Color model     (records: red, blue, green, …)
Size model      (records: S, M, L, XL)
Material model  (records: cotton, wool, polyester)

Product.color      (link → Color)
Product.sizes      (links → [Size])
Product.material   (link → Material)
```

Don't encode facets as enum values on single field — lose per-facet metadata (slug, swatch image, sort order), can't add values without migration.

## Design principles

### 1. Mutual exclusivity (when appropriate)

Categories distinct. If items frequently belong to many categories, you wanted tags.

- **Categories** — one primary classification. Tree-shaped, exclusive.
- **Tags** — many optional classifications. Flat, inclusive.

Common mistake: modeling everything as "categories" then allowing many per record. That's tags wearing category costume.

### 2. User-centric naming

Use terms your audience uses, not internal jargon.

- ❌ "Content assets" (internal)
- ✅ "Resources" or "Downloads" (user-facing)

Applies to taxonomy _labels_ and model `api_key` — both leak into URLs, editor UI, sometimes public GraphQL schema.

### 3. Balanced depth

- Too shallow → everything lumped, no useful filtering.
- Too deep → editors/users can't find anything.

**Rule of thumb: 3–4 levels max** for hierarchies. If you need 5+, leaves usually facets in disguise.

### 4. Scalable structure

Design for 10× growth. _"Will this work with 10,000 items and 500 categories?"_ If answer is "the editor will manage it manually" — it won't.

## Cascade strategies on taxonomy links

Link validators (`item_item_type`, `items_item_type`, `structured_text_links`) carry three cascade-strategy fields governing linked record state changes. For taxonomies these matter because deleting category should **not** silently delete every product in it.

| Strategy field | Safe taxonomy default | Why |
| - | - | - |
| `on_publish_with_unpublished_references_strategy` | `"fail"` | Don't accidentally publish product whose category still draft |
| `on_reference_unpublish_strategy` | `"fail"` | Unpublishing category requires explicit handling, not silent breakage |
| `on_reference_delete_strategy` | `"fail"` or `"set_to_null"` | Almost never `"delete_references"` for taxonomy — would delete the products |

Full validator/cascade reference: `../../datocms-cma/references/schema.md`. Configuring on link / links / structured_text_links validators: `field-configuration.md` § Constrain links between records.

## Querying taxonomies

GraphQL read patterns (filtering by taxonomy, getting items in category-or-its-children, building category trees): see `datocms-cda` skill. Query shapes belong there, not here.

## Common mistakes

### Over-categorization

Category for everything → mostly-empty categories, useless filtering. **Fix:** start minimal, add categories as content grows.

### Inconsistent granularity

Some categories broad (`Technology`), others narrow (`React 18 Server Components`). Both can't coherently sit at same tree level. **Fix:** define explicit criteria for what merits category vs tag.

### No governance

If anyone can create taxonomy records → duplicates (`JavaScript`, `Javascript`, `JS`, `javascript`). **Fix:** restrict who can create/edit taxonomy records via roles, validate slugs against duplicates.

### Hierarchy modeled without `tree: true`

Category model with `parent` link to itself, manually-managed `position` integer, editor UI unaware any of this is tree. **Fix:** rebuild as tree model. One-time migration cost.

### Tag values stored as free-text string field

Comma-separated tags in single `string` field. No deduplication, no slugs, no governance, can't query by tag without `LIKE` hacks. **Fix:** model tags as Tag model + `links` field on consumer.
