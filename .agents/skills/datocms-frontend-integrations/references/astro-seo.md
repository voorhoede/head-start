# Astro SEO & Meta Tags — `<Seo />`

See `seo-concepts.md` for the shared GraphQL query shape and tag concatenation pattern.

Astro component for rendering SEO meta tags, social share tags, and favicons from DatoCMS's `_seoMetaTags` and `faviconMetaTags` GraphQL queries. Unlike React's `renderMetaTags()` / `toNextMetadata()`, Vue's `toHead()`, or Svelte's `<Head />`, Astro uses a `<Seo />` component that injects `<title>`, `<meta>`, and `<link>` tags into the document's `<head>`.

## Contents

- Setup
- GraphQL Queries
- `<Seo />`
- `renderMetaTagsToString()`
- Utility Summary

## Setup

```js
import { Seo } from '@datocms/astro/Seo';
```

**Note:** `@datocms/astro` uses subpath imports — always import from `@datocms/astro/Seo`, not from `@datocms/astro`.

## GraphQL Queries

See `seo-concepts.md` for the query shape and tag concatenation pattern. Examples below assume tags are fetched as `result.page.seo` and `result.site.favicon`.

## `<Seo />`

The `<Seo />` component takes a `data` prop — an array of `Tag` objects (with `attributes`, `content`, `tag` properties) in the exact shape returned by DatoCMS's `_seoMetaTags` and `faviconMetaTags` queries — and injects them into the document's `<head>`.

### Basic Usage

```astro
---
import { Seo } from '@datocms/astro/Seo';
import { executeQuery } from '@datocms/cda-client';

const query = `
  query {
    page: homepage {
      title
      seo: _seoMetaTags {
        attributes
        content
        tag
      }
    }
    site: _site {
      favicon: faviconMetaTags {
        attributes
        content
        tag
      }
    }
  }
`;

const result = await executeQuery(query, { token: '<YOUR-API-TOKEN>' });
---

<html>
  <head>
    <Seo data={[...result.page.seo, ...result.site.favicon]} />
  </head>
  <body>
    <h1>{result.page.title}</h1>
  </body>
</html>
```

### Layout Example

Place `<Seo />` in a shared layout component:

```astro
---
// src/layouts/Layout.astro
import { Seo } from '@datocms/astro/Seo';

const { seoData } = Astro.props;
---

<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Seo data={seoData} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

Then use it from a page:

```astro
---
// src/pages/index.astro
import Layout from '~/layouts/Layout.astro';
import { executeQuery } from '@datocms/cda-client';

const result = await executeQuery(query, { token: '<YOUR-API-TOKEN>' });
const seoData = [...result.page.seo, ...result.site.favicon];
---

<Layout seoData={seoData}>
  <h1>{result.page.title}</h1>
</Layout>
```

## `renderMetaTagsToString()`

For server-side HTML string generation (e.g., in middleware, API routes, or non-component contexts), use `renderMetaTagsToString()`:

```js
import { renderMetaTagsToString } from '@datocms/astro/Seo';

const htmlString = renderMetaTagsToString([...result.page.seo, ...result.site.favicon]);
// Returns a string of <title>, <meta>, and <link> HTML tags
```

## Utility Summary

| Utility | Type | Use Case |
| - | - | - |
| `<Seo />` | Astro component | Injects `<title>`, `<meta>`, `<link>` tags into `<head>` |
| `renderMetaTagsToString()` | Function | Server-side HTML string generation |

**Note:** Unlike react-datocms which provides multiple utilities (`renderMetaTags`, `toNextMetadata`, `toRemixMeta`, `renderMetaTagsToString`) and vue-datocms which provides `toHead()`, `@datocms/astro` uses the `<Seo />` component for in-template usage and `renderMetaTagsToString()` for string output.
