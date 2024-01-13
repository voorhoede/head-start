# Accordion Component

**Renders a list of items as an accordion, expanding only a single item at a time.**

## Notes

- Uses native `<details>` and `<summary>` elements.
- Uses shared `details[name]` attribute, to create an exclusive accordion (only a single item is expanded at a time). Can be [polyfilled for older browsers](https://developer.chrome.com/docs/css-ui/exclusive-accordion#polyfill_the_exclusive_accordion).
- Supports `open` property to initially render an item expanded.
- Uses custom `<Icon>`s to display open/closed state.

## Usage

```astro
---
import { Accordion, AccordionItem } from '@components/Accordion';
name = 'demo-accordion';
---

<Accordion>
  <AccordionItem name={ name } open={ true }>
    <Fragment slot="heading">Heading A</Fragment>
    <Fragment slot="body">Body A</Fragment>
  </AccordionItem>
  <AccordionItem name={ name }>
    <Fragment slot="heading">Heading B</Fragment>
    <Fragment slot="body">Body B</Fragment>
  </AccordionItem>
</Accordion>
```

## Relevant links

- [web.dev: Exclusive Accordion](https://developer.chrome.com/docs/css-ui/exclusive-accordion)
