# Assets

**Head Start provides a pre-configured setup for common assets like fonts and icons.**

## `src/assets/` vs `public/` assets

[Astro copies all assets in `public/` to the web root](https://docs.astro.build/en/basics/project-structure/#public) (`dist/`). Using [the `public/` directory](../public/) is suitable for static assets that don't require a build step and should be available as is. For example a some `.wellknown` file.

Head Start uses [the `src/assets/` directory](../src/assets/) to organise raw assets that do require a build step. You are responsible for the processing and importing of these assets. Head Start provides a pre-configured setup for [fonts](#fonts) and [icons](#icons). These assets are eventually compiled to `dist/_astro/` and are configured to be served with immutable cache headers for performance.


## Fonts

Head Start provides a setup for custom fonts to improve their loading performance. An example font (Archivo) is pre-configured in [`src/assets/fonts.ts`](../src/assets/fonts.ts). To add your own custom fonts:

1. Install the custom font. If it's an open source font, the easiest way is to [install your custom font using Fontsource](https://fontsource.org/docs/getting-started/install). Otherwise copy your custom font files (`woff2`) to `src/assets/fonts/` manually.
2. Replace the example font imports in [`src/assets/fonts.ts`](../src/assets/fonts.ts) with those of your custom fonts.
3. Replace the `const fonts` and `const fontsFamily...` values to match the name and variations of your custom fonts.

That's it. Head Start will now automatically preload the font files and include critical CSS for your custom fonts.


## Icons

Head Start combines icons in a sprite and makes them available through the `<Icon>` component. To use an icon:

1. Add an SVG icon to [`src/assets/icons/`](../src/assets/icons/). For example a `share.svg` icon.
2. Use the `Icon` component with `name="share"` (SVG file basename):

```astro
---
import Icon from '@components/Icon/';
---
<Icon name="share">

<style>
  /* optional: style on data attribute, or add a class */
  [data-icon="share"] {
    color: red;
  }
</style>
```

## Service Worker

Head Start provides a fully customisable service worker in [`src/assets/service-worker.ts`](../src/assets/service-worker.ts) that's automatically bundle and served as `/service-worker.js` (in both development and production) and registered in each web page (using inline script in `src/layouts/PerfHead`). The service worker uses the low-level [Workbox modules](https://developer.chrome.com/docs/workbox/modules) for fine-grained control.

For more background see [decision log on service worker](./decision-log/2025-01-11-service-worker.md).
