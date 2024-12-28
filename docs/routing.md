# Routing

**Head Start leverages [Astro file-based routing](https://docs.astro.build/en/core-concepts/routing/#_top) combined with Cloudflare features for redirects and page not found behaviour. The setup is enhanced with i18n routing, API routing, nested page routing and helpers to resolve routes.**

## Routing middleware

Head Start leverages [Astro middleware](https://docs.astro.build/en/guides/middleware/) to add checks, data and error handling to routes. See [`src/middleware/` directory for details](../src/middleware/).

## I18n routes

Head Start supports multi-language websites with localised routing (`/:locale/page/to/page/`). See [i18n configuration and routing](./i18n.md).

## Nested routes

Head Start supports nested pages, so editors can create page URLs like `/en/overview-page/category-page/detail-page/`. This is achieved using a `parentPage` field* in Page models in the CMS, combined with a catch all route `src/pages/[locale]/[...path]/` using [Astro rest parameters](https://docs.astro.build/en/core-concepts/routing/#rest-parameters). This setup can be copied for new page models added to your project.

To make nested routes more useful for website visitors and easier to manage for developers, Head Start provides a [Breadcrumbs component](../src/components/Breadcrumbs/) and [`getHref()` helpers for all linkable models](../src/lib/routing/index.ts).

\* See [decision entry on nested page setup](./decision-log/2023-12-26-nested-page-setup.md) for motivation.

## Internal links to records

Content editors can link to other models (like Home or generic Page) within Structured Text fields. To create nodes for these links, Head Start provides a reusable [Item Link](../src/blocks/TextBlock/nodes/ItemLink.astro).

When you want to make a new content model available for linking:

1. Add the model to the references option of all relevant Structured Text fields in the CMS.
2. Add the links to the GraphQL fragments of the related blocks (like [`TextBlock.fragment.graphql`](../src/blocks/TextBlock/TextBlock.fragment.graphql)).
3. Extend the generic [`getHref()` helper](../src/lib/routing/index.ts) to resolve the URL for the new model.

\* See [decision entry on record linking](./decision-log/2024-10-31-record-linking.md) for motivation.

## 404 routes

Head Start leverages [Astro's Custom 404 Error page](https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page) (located in [`src/pages/404.astro`](../src/pages/404.astro)), connected to the Not Found model in DatoCMS.

## API routes

Astro supports [API routes](https://docs.astro.build/en/core-concepts/endpoints/#server-endpoints-api-routes) (server endpoints), which can be any route in `src/pages/`. Head Start uses a convention to place all API routes in `src/pages/api/`. This way it's clear where all API routes live, they have a logical URL prefix in the browser (`/api/`) and [API routes not found](../src/pages/api/[...notFound].ts) can be caught and respond with a 404 JSON response, rather than an HTML response.

## Partial page routes

Astro supports [Page Partials](https://docs.astro.build/en/basics/astro-pages/#page-partials) to fetch and use in conjuction with client-side scripts. As a convention Head Start uses a `.partial.astro` for these routes. An example is the [`search/results.partial.astro` route](../src/pages/[locale]/search/results.partial.astro).

## Redirects

Head Start supports redirect rules which are editable and [sortable](https://www.datocms.com/docs/content-modelling/record-ordering) in the CMS. Head Start uses [`regexparam`](https://github.com/lukeed/regexparam) to handle redirect rules with static paths, (optional) parameters and (optional) wildcards. Examples:

- from `/redirect/static-path/` to `/new-static-path/`
- from `/path-with-param/:name/` to `/new-path-with-param/:name/more-slug`
- from `/path-with-wildcard/*` to `/new-path-with-wildcard/*` (or `/new-path-with-wildcard/:splat`)

\* See [decision entry on redirects](./decision-log/2024-09-24-redirects-middleware.md) for motivation.

## Cloudflare runtime

Head Start uses the [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) to deploy to Cloudflare Pages. This means routes have access to the [Cloudflare runtime](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#cloudflare-runtime) via `locals.runtime`. For example, each dynamic route, has access to geo information of the request:

```ts
export function GET ({ locals }) {
  const { city, latitude, longitude } = locals.runtime.cf;
  return new Response(JSON.stringify({ city, latitude, longitude }, null, 2));
}
```