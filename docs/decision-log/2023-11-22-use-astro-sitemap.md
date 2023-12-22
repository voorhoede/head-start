# Use `@astro/sitemap` package

**Use the official [`@astro/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/) package to generate an XML sitemap for all pages.**

- Date: 2023-11-22
- Alternatives Considered: Voorhoede tooling recipe, custom script for this code base
- Decision Made By: [Jasper](https://github.com/jbmoelker)

## Decision

The `@astro/sitemap` package taps directly into Astro's `getStaticPaths()` to list all pages. It also automatically excludes 404 pages, and offers configuration options to add more functionality add a later point. This makes it more convenient than using a Voorhoede tooling recipe or writing a custom script specificly for this code base.

We've also decided to keep the XML sitemap and its configuration simple for now. Considerations made:

- XML sitemaps support `changefreq`, `lastmod` and `priority`. We can add our logic to set these values per page using the [`@astro/sitemap` `serialize` feature](https://docs.astro.build/en/guides/integrations-guide/sitemap/#serialize). However it adds a lot of complexity, so weI prefer to let Google (and Bing etc) figure out how often something has changed.
- XML sitemaps support providing `alternate` urls for a url in different locales. However the [`@astro/sitemap` `i18n` feature](https://docs.astro.build/en/guides/integrations-guide/sitemap/#i18n) is naive in expecting that only the locale prefix changes and the slugs are the same for different locales. So this is not usable. And adding our own logic again adds complexity. Each page already has `link[alternate][hreflang]` references. So we prefer to let Google (and Bing etc) do their work and figure out those pages are related.
