# Routing

**Head Start leverages [Astro file-based routing](https://docs.astro.build/en/core-concepts/routing/#_top) combined with Cloudflare features for redirects and page not found behaviour. The setup is enhanced with i18n routing, API routing, nested page routing and helpers to resolve routes.**

## I18n routes

Head Start supports multi-language websites with localised routing (`/:locale/page/to/page/`). See [i18n configuration and routing](./i18n.md).

## Nested routes

Head Start supports nested pages, so editors can create page URLs like `/en/overview-page/category-page/detail-page/`. This is achieved using a `parentPage` field* in Page models in the CMS, combined with a catch all route `src/pages/[locale]/[...path]/` using [Astro rest parameters](https://docs.astro.build/en/core-concepts/routing/#rest-parameters). This setup can be copied for new page models added to your project.

To make nested routes more useful for website visitors and easier to manage for developers, Head Start provides a [Breadcrumbs component](../src/components/Breadcrumbs/) and an [Internal Link component](../src/blocks/InternalLink/) which resolves URLs for all content models.

\* See [decision entry on nested page setup](./decision-log/2023-12-26-nested-page-setup.md) for motivation.

## 404 routes

Head Start leverages [Astro's Custom 404 Error page](https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page) (located in [`src/pages/404.astro`](../src/pages/404.astro)), connected to the Not Found model in DatoCMS.

## API routes

Astro supports [API routes](https://docs.astro.build/en/core-concepts/endpoints/#server-endpoints-api-routes) (server endpoints), which can be any route in `src/pages/`. Head Start uses a convention to place all API routes in `src/pages/api/`. This way it's clear where all API routes live, they have a logical URL prefix in the browser (`/api/`) and [API routes not found](../src/pages/api/[...notFound].ts) can be caught and respond with a 404 JSON response, rather than an HTML response.

## Redirects

Head Start supports redirect rules which are editable and [sortable](https://www.datocms.com/docs/content-modelling/record-ordering) in the CMS. Head Start uses [`regexparam`](https://github.com/lukeed/regexparam) to handle redirect rules with static paths, (optional) parameters and (optional) wildcards. Examples:

- from `/redirect/static-path/` to `/new-static-path/`
- from `/path-with-param/:name/` to `/new-path-with-param/:name/more-slug`
- from `/path-with-wildcard/*` to `/new-path-with-wildcard/*` (or `/new-path-with-wildcard/:splat`)

\* See [decision entry on redirects](./decision-log/2024-09-24-redirects-middleware.md) for motivation.
