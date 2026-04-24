# Structured Text

**Renders the content from a [DatoCMS Structured Text](https://www.datocms.com/docs/structured-text/dast) field using the [DatoCMS Astro StructuredText component](https://www.datocms.com/docs/astro/structured-text-fields).**

## Setup

```astro
---
import Text from '~/components/Text/Text.astro';
---

<Text data={block.text} />
```

## Blocks and links

A Structured Text field can reference other DatoCMS records as **blocks** (full-width embedded records), **inline blocks** (inline embedded records), **item links** (links to records), and **inline records** (inline record references).

`Text.astro` automatically maps each `__typename` in `data.blocks`, `data.inlineBlocks`, and `data.links` to the right component, so you don't need to configure anything manually — just make sure the field's GraphQL fragment includes the relevant nested data.


## Node overrides

Some DAST node types are rendered with custom components instead of the defaults provided by `@datocms/astro`:

| Node | Component | Reason |
| --- | --- | --- |
| `heading` | `nodes/Heading.astro` | Promotes `h1` to `h2` (page `<h1>` is reserved for the page title) and supports a `centered` style |
| `paragraph` | `nodes/Paragraph.astro` | Supports a `centered` style from DatoCMS |
| `code` | `nodes/Code.astro` | Renders a plain `<pre><code>` block to avoid unencoded characters from Shiki |

To add or change a node override, add a component to `nodes/` and register it in the `nodeOverrides` prop inside `Text.astro`.