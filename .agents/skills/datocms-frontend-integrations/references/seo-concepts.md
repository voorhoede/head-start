# SEO & Meta Tags Concepts

Shared concepts for DatoCMS SEO metadata rendering across all frameworks. For framework-specific rendering utilities and components, see the dedicated framework reference.

## GraphQL Query

```graphql
query {
  page: homepage {
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
```

## Tag Concatenation Pattern

Always concatenate page SEO tags with site favicon tags before rendering:

```js
const allMetaTags = [...data.page.seo, ...data.site.favicon];
```

This ensures both page-specific meta tags (title, description, OG tags) and site-wide favicon tags are rendered together.

## Tag Object Shape

Each tag in the `_seoMetaTags` and `faviconMetaTags` arrays has this shape:

```ts
{
  tag: string;        // "title", "meta", or "link"
  attributes: object | null; // HTML attributes (e.g., { property: "og:title", content: "..." })
  content: string | null;    // Inner content (only for "title" tags)
}
```
