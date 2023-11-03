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
  [astro-icon="share"] {
    color: red;
  }
</style>
```

## Notes

- Uses [`astro-icon`](https://github.com/natemoo-re/astro-icon) which provides `[astro-icon]` as styling hook.
- Uses [`astro-icon`](https://github.com/natemoo-re/astro-icon) which offers both an inline `Icon` and a `Sprite` icon component. For performance we always want to use the `Sprite` component. But since that can be confusing, this component simply exposes that `Sprite` component as `Icon`.
