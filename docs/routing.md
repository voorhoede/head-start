# Routing

**Head Start leverages [Astro file-based routing](https://docs.astro.build/en/core-concepts/routing/#_top) combined with Cloudflare features for redirects and page not found behaviour. The setup is enhanced with i18n routing, API routing, nested page routing and helpers to resolve routes.**

## I18n routes

Head Start supports multi-language websites with localised routing (`/:locale/page/to/page/`). See [i18n configuration and routing](./i18n.md).

## Nested routes

Head Start supports nested pages, so editors can create page URLs like `/en/overview-page/category-page/detail-page/`. This is achieved using a `parentPage` field* in Page models in the CMS, combined with a catch all route `src/pages/[locale]/[...path]/` using [Astro rest parameters](https://docs.astro.build/en/core-concepts/routing/#rest-parameters). This setup can be copied for new page models added to your project.

To make nested routes more useful for website visitors and easier to manage for developers, Head Start provides a [Breadcrumbs component](../src/components/Breadcrumbs/) and an [Internal Link component](../src/blocks/InternalLink/) which resolves URLs for all content models.

\* See [decision entry on nested page setup](./decision-log/2023-12-26-nested-page-setup.md) for motivation.

## 404 routes

Head Start leverages [Cloudflare's Not Found behaviour](https://developers.cloudflare.com/pages/configuration/serving-pages/#not-found-behavior), which supports different 404 pages on different routes. Cloudflare will look up the directory tree until it finds a matching 404 page. A localised [root 404 page](../src/pages/[locale]/404.astro) is provided and can be edit from the CMS. You can add more specific 404 pages on specific routes, for example a `src/pages/[locale]/products/404.astro`.

## API routes

Astro supports [API routes](https://docs.astro.build/en/core-concepts/endpoints/#server-endpoints-api-routes) (server endpoints), which can be any route in `src/pages/`. Head Start uses a convention to place all API routes in `src/pages/api/`. This way it's clear where all API routes live, they have a logical URL prefix in the browser (`/api/`) and [API routes not found](../src/pages/api/[...notFound].ts) can be caught and respond with a 404 JSON response, rather than an HTML response.

## Redirects

Head Start supports redirect rules which are editable and [sortable](https://www.datocms.com/docs/content-modelling/record-ordering) in the CMS. These redirect rules are compiled to a [Cloudflare Pages `_redirects` file](https://developers.cloudflare.com/pages/configuration/redirects/)* during build, and support placeholders (`:placeholder_name`) and wildcards (`:*` -> `:splat`).

\* See [decision entry on editable redirects](./decision-log/2024-01-20-editable-redirects.md) for motivation.
