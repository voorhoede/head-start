# Table Block

**Display tabular data in a responsive layout with an optional title.**

## Notes

* Table data format is based on output of the [DatoCMS Table Editor](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-table-editor).
* Table includes a [`<caption>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption) when a `title` is provided for improved accessibility.
* Table can have a header row and a header column. When set, these are positioned sticky for improved responsive behaviour ([inspiration](https://css-tricks.com/a-table-with-both-a-sticky-header-and-a-sticky-first-column/)).
* Basis styling not required for the responsive behaviour is also provided and can be safely replaced. 

## Relevant links

* [CSS-Tricks: A table with both a sticky header and a sticky first column](https://css-tricks.com/a-table-with-both-a-sticky-header-and-a-sticky-first-column/)
* [CSS-Tricks: Responsive data tables](https://css-tricks.com/responsive-data-tables/), inspiration to improve table layout on smaller screens or in narrow container (when combined with [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)).
