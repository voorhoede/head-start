# Localization

Covers querying localized content: site locales, query-level and field-level locale arguments, fallback locales, fetching all locale values, and filtering by locale availability.

## Contents

- Get Site Locales
- Record Available Locales
- Query-Level Locale
- Per-Field Locale Override
- Fallback Locales
- All Locale Values
- Complete Example

## Get Site Locales

```graphql
query {
  _site {
    locales
  }
}
```

Returns an array of locale codes in the order configured in the project (e.g., `["en", "it", "fr"]`). The first locale is the project's default locale.

## Record Available Locales

The `_locales` field on any record returns which localizations are actually present:

```graphql
query {
  allBlogPosts {
    _locales
    title
  }
}
```

### Filtering by Locale Availability

| Operator | Description |
| - | - |
| `allIn` | Records with ALL specified locales present |
| `anyIn` | Records with at least one specified locale |
| `notIn` | Records lacking all specified locales |

```graphql
query {
  allBlogPosts(filter: { _locales: { anyIn: [it, en] } }) {
    title
  }
}
```

## Query-Level Locale

Pass the `locale` argument on the query to set the locale for all localized fields. Without it, fields return the project's default (first) locale.

```graphql
query {
  allBlogPosts(locale: it) {
    title
    body
  }
}
```

Single record queries also accept `locale`:

```graphql
query {
  blogPost(locale: it, filter: { slug: { eq: "ciao-mondo" } }) {
    title
    body
  }
}
```

**Important:** When you set `locale` on a query, **filters apply to that locale's field values**. In the example above, `slug: { eq: "ciao-mondo" }` matches the Italian slug, not the default-locale slug.

## Per-Field Locale Override

Individual fields can override the query-level locale. Use GraphQL aliases to fetch multiple locales of the same field:

```graphql
query {
  allBlogPosts(locale: it) {
    title
    enTitle: title(locale: en)
    frTitle: title(locale: fr)
  }
}
```

## Fallback Locales

When the requested locale value is `null`, an empty string, or an empty array, the system sequentially tries each locale in the `fallbackLocales` array until a non-empty value is found.

### Query-Level Fallback

```graphql
query {
  allBlogPosts(locale: it_IT, fallbackLocales: [it, en]) {
    title
  }
}
```

This tries `it_IT` first, then `it`, then `en`.

### Per-Field Fallback

```graphql
query {
  allBlogPosts {
    title(locale: it_IT, fallbackLocales: [it, en])
  }
}
```

## All Locale Values

The `_all<FieldName>Locales` pattern returns every localized value for a field as an array of `{ locale, value }` objects:

```graphql
query {
  allBlogPosts {
    _allTitleLocales {
      locale
      value
    }
  }
}
```

Returns:

```json
[
  { "locale": "en", "value": "Hello!" },
  { "locale": "it", "value": "Ciao!" }
]
```

This also works with `fallbackLocales`:

```graphql
query {
  allBlogPosts {
    _allTitleLocales(fallbackLocales: [en]) {
      locale
      value
    }
  }
}
```

## Complete Example

```ts
import { executeQuery } from "@datocms/cda-client";

const query = `
  query MultiLocaleContent($locale: SiteLocale!, $fallbacks: [SiteLocale!]!) {
    _site {
      locales
    }
    allBlogPosts(locale: $locale, fallbackLocales: $fallbacks) {
      id
      title
      enTitle: title(locale: en)
      _allTitleLocales {
        locale
        value
      }
      _locales
    }
  }
`;

const data = await executeQuery(query, {
  token: process.env.DATOCMS_CDA_TOKEN!,
  variables: {
    locale: "it",
    fallbacks: ["en"],
  },
});

for (const post of data.allBlogPosts) {
  console.log(`IT: ${post.title}`);
  console.log(`EN: ${post.enTitle}`);
  console.log(`Available locales: ${post._locales.join(", ")}`);
}
```
