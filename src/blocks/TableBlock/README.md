# Table Block

**Display tabular data in a responsive layout with an optional title.**

## Features

* Table data format is based on output of the [DatoCMS Table Editor](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-table-editor).
* Table includes a (fig)caption when a `title` is provided for improved accessibility.
* Table can have a header row and a header column. Headers have [`scope=col|row`](https://www.w3.org/WAI/WCAG21/Techniques/html/H63) for improved accessibilty.
* When the header column is enabled it's behaving as a sticky first column.
* Support for both a sticky header and sticky first column requires some extra work and JS. To avoid complexity in Head Start this is kept out of scope.
* Basis styling not required for the responsive behaviour is also provided and can be safely replaced. 

## Relevant links

* [UXDesign: Position stuck](https://uxdesign.cc/position-stuck-96c9f55d9526), solve combination of sticky headers and horizontal scrolling using JavaScript.
* [CSS-Tricks: A table with both a sticky header and a sticky first column](https://css-tricks.com/a-table-with-both-a-sticky-header-and-a-sticky-first-column/).
* [CSS-Tricks: Responsive data tables](https://css-tricks.com/responsive-data-tables/), inspiration to improve table layout on smaller screens or in narrow container (when combined with [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)).
