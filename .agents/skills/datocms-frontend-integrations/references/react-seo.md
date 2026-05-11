# React SEO & Meta Tags

See `seo-concepts.md` for the shared GraphQL query shape and tag concatenation pattern.

Utilities for rendering SEO meta tags, social share tags, and favicons from DatoCMS's `_seoMetaTags` and `faviconMetaTags` GraphQL queries.

## Contents

- GraphQL Queries
- `renderMetaTags()`
- `renderMetaTagsToString()`
- `toNextMetadata()`
- `toRemixMeta()`
- Utility Summary

## GraphQL Queries

See `seo-concepts.md` for the query shape and tag concatenation pattern. Examples below assume tags are fetched as `data.page.seo` and `data.site.favicon`.

## `renderMetaTags()`

Generates React `<meta>`, `<link>`, and `<title>` elements. Works with `react-helmet` and React 19+ native meta tags.

### With react-helmet

```jsx
import { renderMetaTags } from 'react-datocms';
import { Helmet } from 'react-helmet';

function Page({ data }) {
  return (
    <Helmet>
      {renderMetaTags([...data.page.seo, ...data.site.favicon])}
    </Helmet>
  );
}
```

### With React 19+ (no external library)

```jsx
import { renderMetaTags } from 'react-datocms';

function Page({ data }) {
  return (
    <div>
      {renderMetaTags([...data.page.seo, ...data.site.favicon])}
    </div>
  );
}
```

## `renderMetaTagsToString()`

Generates an HTML string of `<meta>` and `<link>` tags for server-side rendering:

```js
import { renderMetaTagsToString } from 'react-datocms';

const html = `
  <html>
    <head>
      ${renderMetaTagsToString([...data.page.seo, ...data.site.favicon])}
    </head>
  </html>
`;
```

## `toNextMetadata()`

Generates a `Metadata` object for Next.js `generateMetadata` export:

```ts
import { toNextMetadata } from 'react-datocms';

export async function generateMetadata(): Promise<Metadata> {
  const { homepage } = await getHomepageContent();

  return toNextMetadata(homepage?._seoMetaTags || []);
}
```

## `toRemixMeta()`

Generates an array of `MetaDescriptor` objects for Remix v2 `meta` export:

```ts
import type { MetaFunction } from 'remix';
import { toRemixMeta } from 'react-datocms';

export const meta: MetaFunction = ({ data: { post } }) => {
  return toRemixMeta(post.seo);
};
```

**Note on favicons in Remix:** The `links` export doesn't receive loader data. Render favicons using `renderMetaTags` in your root component instead:

```jsx
import { renderMetaTags } from 'react-datocms';

export default function App() {
  const { site } = useLoaderData();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {renderMetaTags(site.favicon)}
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
}
```

### Remix v1: `toRemixV1Meta()`

For legacy Remix v1, use `toRemixV1Meta()` which returns an object instead of an array:

```ts
import { toRemixV1Meta } from 'react-datocms';

export const meta: MetaFunction = ({ data: { post } }) => {
  return toRemixV1Meta(post.seo);
};
```

## Utility Summary

| Utility | Output | Use Case |
| - | - | - |
| `renderMetaTags()` | React elements | react-helmet, React 19+ |
| `renderMetaTagsToString()` | HTML string | Server-side rendering |
| `toNextMetadata()` | `Metadata` object | Next.js `generateMetadata` |
| `toRemixMeta()` | `MetaDescriptor[]` | Remix v2 `meta` export |
| `toRemixV1Meta()` | Object | Remix v1 `meta` export (legacy) |
