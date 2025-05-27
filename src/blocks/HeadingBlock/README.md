# Heading Block

**Renders H2-H6 elements with a different heading styles or an optional subtitle**

> [!NOTE]
> This block is most useful to explicitly include a header between other blocks resulting in a more explicit authoring experience. Also, this block is useful for adding subtitles or overriding the defined style in the editor. When adding subtitles, pay attention to the DOM Order vs the visual order. Update the component to suite your needs accordingly.

## Features

- Renders text content in `h2`, `h3`, `h4`, `h5`, or `h6` element, 
  but passes the heading level set in the WYSIWYG editor the as a class.
  Use globally defined heading classes to style the headings.
- `level` field for numbers between 2 and 6
