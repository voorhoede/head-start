# SEO and Meta Tags

Covers `_seoMetaTags`, `faviconMetaTags`, `globalSeo`, and SEO field values.

## Contents

- `_seoMetaTags`
- `faviconMetaTags`
- `globalSeo`
- SEO Field Values
- Complete Example: SEO Head Tags

## `_seoMetaTags`

Available on every record. Returns an array of computed meta tag objects, merging the record's SEO field values with global SEO fallbacks. If no explicit SEO field exists on the model, the system inspects other fields (single-line strings and images) to generate defaults.

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    title
    _seoMetaTags {
      tag
      attributes
      content
    }
  }
}
```

Each element in the array:

| Field | Type | Description |
| - | - | - |
| `tag` | `String` | HTML tag name (e.g., `"meta"`, `"title"`, `"link"`) |
| `attributes` | `MetaTagAttributes` | Key-value pairs for tag attributes (e.g., `{ "property": "og:title", "content": "Hello" }`) |
| `content` | `String` | Inner content of the tag (for elements like `<title>`) |

### Generated Tags Include

- **Title:** `title`, `og:title`, `twitter:title`
- **Description:** `description`, `og:description`, `twitter:description`
- **Image:** `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image`, `twitter:image:alt`
- **Index control:** `robots` with `noindex` when indexing is disabled
- **Social:** `og:locale`, `og:type` (`"website"`), `og:site_name`, `twitter:site`, `twitter:card`, `article:modified_time`, `article:publisher`

The title suffix from global SEO settings is appended to the `title` tag only if the combined length is 60 characters or fewer. It is **not** appended to `og:title` or `twitter:title`.

`_seoMetaTags` also accepts a `locale` argument for multi-language projects:

```graphql
_seoMetaTags(locale: it) {
  tag
  attributes
  content
}
```

## `faviconMetaTags`

Available under `_site`. Returns favicon-related meta tags with a `variants` argument to select which types to include:

```graphql
query {
  _site {
    faviconMetaTags(variants: [icon, appleTouchIcon, msApplication]) {
      tag
      attributes
    }
  }
}
```

| Variant | Description |
| - | - |
| `icon` | Standard favicon tags |
| `appleTouchIcon` | Apple touch icon tags |
| `msApplication` | Microsoft application tile tags |

## `globalSeo`

Available under `_site`. Returns global SEO settings:

```graphql
query {
  _site {
    globalSeo {
      siteName
      titleSuffix
      twitterAccount
      facebookPageUrl
      fallbackSeo {
        title
        description
        twitterCard
        image {
          url
          width
          height
          alt
        }
      }
    }
  }
}
```

The `_site` query also exposes `noIndex` (the project-level "prevent search engine indexing" toggle):

```graphql
query {
  _site {
    noIndex
    globalSeo { siteName }
  }
}
```

For multi-language projects, `globalSeo` accepts a `locale` argument:

```graphql
globalSeo(locale: en) {
  siteName
  titleSuffix
}
```

## SEO Field Values

When a model has an explicit SEO field, query its raw values directly:

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    seo {
      title
      description
      image {
        url
      }
      twitterCard
      noIndex
    }
  }
}
```

| Field | Type | Description |
| - | - | - |
| `title` | `String` | SEO title override |
| `description` | `String` | Meta description override |
| `image` | `Upload` | Social sharing image |
| `twitterCard` | `String` | Twitter card type |
| `noIndex` | `Boolean` | Prevent search engine indexing |

## Complete Example: SEO Head Tags

```ts
import { executeQuery } from "@datocms/cda-client";

const query = `
  query PageSeo($slug: String!) {
    page(filter: { slug: { eq: $slug } }) {
      title
      _seoMetaTags {
        tag
        attributes
        content
      }
    }
    _site {
      faviconMetaTags(variants: [icon, appleTouchIcon, msApplication]) {
        tag
        attributes
      }
      globalSeo {
        siteName
        titleSuffix
      }
    }
  }
`;

const data = await executeQuery(query, {
  token: process.env.DATOCMS_CDA_TOKEN!,
  excludeInvalid: true,
  variables: { slug: "my-page" },
});

// Combine page SEO tags with favicon tags for the <head>
const allMetaTags = [
  ...data.page._seoMetaTags,
  ...data._site.faviconMetaTags,
];

// Render tags in your framework's <head> component
```
