# Performance

**Head Start is built with performance-minded technology and introduces additional performance patterns. In addition we have some tips to further tune the performance of your specific project.**

## Zero JS by default

Head Start has selected Astro as its web framework, for one reason Astro being zero JS by default. This provides a much better performance baseline than the popular isomorphic meta frameworks out there. Head Start embraces the Zero JS by default and only adds improved interactivity through progressive enhancement using standalone Web Components. You are free to add a JS framework when using Head Start for your project. Astro plays well with all of them. We advice to use a performance-minded framework like Preact or Svelte when possible.


## Pre and Edge rendering

Head Start is configured to pre-render all routes by default (using [Astro's `output: 'static'`](https://docs.astro.build/en/reference/configuration-reference/#output)). This means every route is cached as a static file by default. Which is great for performance. Routes that require [on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/), opt-out of pre-rendering using `export const prerender = false`. These routes are then executed runtime on Cloudflare edge workers. These are faster than traditional serverless functions with a Node.js runtime. While a bit less powerful these Cloudflare Workers are great for performance. If you use on-demand rendering we advice you to [configure cache for runtime routes](#tip-cache-runtime-routes) for more performance.


## DatoCMS image service

Head Start uses DatoCMS which comes with its own [image service](https://www.datocms.com/docs/asset-api/images) powered by Imgix, a super-fast CDN optimized for image delivery, which provides on-the-fly image manipulations and caching. Image transformations can be configured entirely through the image URL. By requesting the right size, format, quality and compression the performance can be greatly improved.


## Facade patterns

Head Start uses the facade pattern for embeds like videos. This means a placeholder is displayed on load, and the code required to run the embed is only loaded on intent. This saves on resources and improves performance of the initial page rendering.


## Assets caching

Head Start is configured to serve all generated [assets](./assets.md) (in `/_astro/`) with immutable caching headers (see `public/_headers`). This means subsequent requests can always use the browser's network cache, which significantly speeds up page rendering.


## Resource hints

Head Start uses resource hints to improve perceived page speed. `link[rel=preconnect]` is used to establish early network connections to 3rd party domains (like the DatoCMS assets and graphql subdomains). `link[rel=preload]` is used to load critical resources (like custom fonts) early. These are all configured in [`layouts/PerfHead`](../src/layouts/PerfHead/README.md). You can extend this with your own resources.


## Service Worker

Head Start adds a basic Service Worker with a network-first strategy for pages and a cache-first strategy for assets. This ensures visited pages always load within a few seconds, even when the server can't be reached. The Service Worker setup acts as a foundation for future performance improvements.


## Tip: cache runtime routes

Head Start mostly contains statically generated pages, which are effectively cached as HTML during build-time. Routes with `export const prerender = false` are not cached by default. To improve performance and reduce the load on DatoCMS and possible other services, we advice to cache runtime routes.

For example, cache a route for 60 seconds, on the shared CDN cache, using `s-max-age`, in an Astro page route (`pages/**/*.astro`):

```astro
---
// Set Cache-Control headers for CDN caching
Astro.response.headers.set('Cache-Control', 'public, s-maxage=60');
---
```

Or in an API route (`api/**/*.ts`):

```ts
export const GET: APIRoute = () => {
  return new Response('...', {
    // Set Cache-Control headers for CDN caching
    headers: { 'Cache-Control': 'public, s-maxage=60' },
  });
};
```

Note: this may be integrated into Head Start in the future. See [#198: Cache runtime routes (ISR)](https://github.com/voorhoede/head-start/issues/198).


## Tip: add Astro prefetch

[Astro provides a configurable prefetch behaviour](https://docs.astro.build/en/guides/prefetch/) to improve performance of loading the next page. The prefetching is speculative and trades extra requests and server load for a better user experience. The behaviour doesn't fully work in every browser as Cloudflare does not provide an etag header on pages. While we see the benefits of the Astro prefetch behaviour, we haven't set a default. We advice you to try the feature in your project and configure a setting that works for you.

Note: this may be integrated into Head Start in the future. See [#201: Configure Astro prefetch behaviour](https://github.com/voorhoede/head-start/issues/201).


## Tip: load 3rd party scripts in workers

Most 3rd party modules are installed via npm and bundled as our own application code. We have fine grained control over the version of each module, when, how and what part we import. However most projects will inevitably need to load 3rd party scripts (like analytics) during runtime from 3rd party domains. For those 3rd party scripts we advice to use Partytown.
