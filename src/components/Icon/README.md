# Icon

**Component to render an SVG icon from `src/icons/`.**

## How to use?

1. Add an SVG icon to `src/icons/`. For example a `share.svg` icon.
2. Use the `Icon` component with `name="share"` (SVG file basename):

```astro
---
import Icon from 'path/to/components/Icon/';
---
<Icon name="share">

<style>
  /* style on data attribute, or add a class */
  [data-icon="share"] {
    color: red;
  }
</style>
```
