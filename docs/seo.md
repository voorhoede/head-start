# Search Engine Optimisation (SEO)

**Head Start is pre-configured to provide an XML sitemap, inject SEO meta, canonical and alternate links.**

## SEO meta data

Head Start utilises the [SEO Preferences and SEO fields in DatoCMS](https://www.datocms.com/docs/content-modelling/seo-fields). The global SEO settings can therefore be configured via SEO Preferences: `/editor/settings` in your CMS instance. For each individual page, its SEO settings can be extended using its SEO field.

To use the SEO data from DatoCMS you must query it, and pass it on to the [default layout](../src/layouts/Default.astro), which in turn uses our [`<SeoHead>` component](../src/components/SeoHead.astro).

For example:

```graphql
query Page($locale: SiteLocale!, $slug: String!) {
  page(locale: $locale, filter: { slug: { eq: $slug } }) {
    _seoMetaTags {
      attributes
      content
      tag
    }
  # ...
```

The [`_seoMetaTags`](https://www.datocms.com/docs/content-delivery-api/seo-and-favicon) contains the merged values of the global SEO Preferences and a page's SEO field. The layout adds them all to the head of the HTML:

```astro
---
import Layout from '@layouts/Default.astro';
const { page } = // ...
---
<Layout
  seoMetaTags={ page._seoMetaTags }
  { ...otherProps }
>
```

## Canonical and alternate links

For SEO it's important that a page has a preferred canonical URL and links to pages in alternate locales. Head Start makes it easy to set these, by providing `pageUrls` to the [default layout](../src/layouts/Default.astro):

```astro
---
import Layout from '@layouts/Default.astro';
---
<Layout 
  pageUrls={[
    { locale: 'en', pathname: '/en/some/path/' },
    { locale: 'nl', pathname: '/nl/ander/pad/' },
    { locale: '..', pathname: '...' },
  ]}
  { ...otherProps }
>
```

The page URL matching the current page locale is used as `link[rel=canonical]`. The other URLs are used as `link[rel=alternate][hreflang={locale}]` (also see [I18n Routing](./i18n.md#routing)). If an empty list of `pageUrls` is provided, Head Start defaults to `/{locale}/` for all links.

## Sitemap

Head Start automatically generates an XML sitemap, using the official [`@astro/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/). The XML sitemap automatically includes all static pages, based on the `getStaticPages()` of all routes. If you need to include dynamic pages, you can configure these using the [`customPages` option in `@astro/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/#custompages).

The [default layout](../src/layouts/Default.astro) and a [`robots.txt`](../src/pages/robots.txt.ts) both link to the generated XML sitemap (`/sitemap-index.xml`), so it's picked up and indexed by search engines.

Note: Head Start does not set `changefreq`, `lastmod` and `priority` values in the XML Sitemap. See [decision log](./decision-log/2023-11-22-use-astro-sitemap.md).
