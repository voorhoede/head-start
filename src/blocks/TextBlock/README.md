# Text Block

**Renders a rich text (Structured Text) field, with nested blocks and internal links.**

> [!NOTE]
> `Text.astro` extends the default `StructuredText` component with custom components for nested blocks and internal links. It's moved into a separate file so other blocks can easily use it too.

## Features

- Renders a rich text component as HTML, with support for headings, lists, bold, italic, emphasized text, etc.
- Renders nested blocks using [`<Blocks />`](../Blocks.astro), so it supports any Block.
- Renders internal links using [`<InternalLink />`](../InternalLink/InternalLink.astro).
- Renders headings with a custom component to avoid having multiple H1's on the page.
