# Querying Basics

Covers the GraphQL endpoint, query naming conventions, single/collection/meta queries, GraphQL variables, record meta fields, and inverse relationships.

## Contents

- GraphQL Endpoint
- Query Naming Conventions
- Single Record Query
- Single-Instance Model Query
- Collection Query
- Meta Count Query
- Record Meta Fields
- GraphQL Variables
- Inverse Relationships
- Complete Example

## GraphQL Endpoint

```
https://graphql.datocms.com/
```

POST-only, read-only — **no mutations**. All content changes go through the CMA (Content Management API).

## Query Naming Conventions

Model API keys map to GraphQL query names following these rules:

- Snake_case API keys become camelCase (e.g., `blog_post` → `blogPost`)
- Collection queries use `all` prefix + English plural (e.g., `allBlogPosts`)
- Meta queries use `_all` prefix + English plural + `Meta` suffix (e.g., `_allBlogPostsMeta`)

| Model API Key | Single Record | Collection | Meta Count |
| - | - | - | - |
| `blog_post` | `blogPost` | `allBlogPosts` | `_allBlogPostsMeta` |
| `artist` | `artist` | `allArtists` | `_allArtistsMeta` |
| `category` | `category` | `allCategories` | `_allCategoriesMeta` |
| `use_case` | `useCase` | `allUseCases` | `_allUseCasesMeta` |

**Tip:** Use the DatoCMS API Explorer at `https://cda-explorer.datocms.com/` to discover exact query names. Pluralization follows English rules (e.g., `category` → `allCategories`, not `allCategorys`).

## Single Record Query

Returns one record matching a filter, or `null` if no match is found. Supports both `filter` and `orderBy` arguments.

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    id
    title
    slug
    content
  }
}
```

When no filter is provided, `orderBy` controls which record is returned (e.g., `blogPost(orderBy: [_publishedAt_DESC])` returns the most recently published record).

## Single-Instance Model Query

Models marked as "single instance" (e.g., homepage, site settings) do not need a filter:

```graphql
query {
  homepage {
    heroTitle
    heroSubtitle
  }
}
```

Single-instance models have no collection or meta queries — only the singular query exists.

## Collection Query

Returns an array of records. Default page size is **20** records.

```graphql
query {
  allBlogPosts {
    id
    title
    slug
  }
}
```

With pagination and ordering:

```graphql
query {
  allBlogPosts(first: 10, skip: 0, orderBy: [_publishedAt_DESC]) {
    id
    title
    slug
  }
}
```

## Meta Count Query

Returns the total number of matching records. The naming pattern is `_all<PluralModelName>Meta`.

```graphql
query {
  _allBlogPostsMeta {
    count
  }
}
```

**Important:** When using filters on the collection query, apply the **same filters** to the meta query to get an accurate count:

```graphql
query {
  allBlogPosts(filter: { category: { eq: "123" } }, first: 10) {
    id
    title
  }
  _allBlogPostsMeta(filter: { category: { eq: "123" } }) {
    count
  }
}
```

## Record Meta Fields

Every record exposes these meta fields (prefixed with underscore):

| Field | Type | Description |
| - | - | - |
| `id` | `ItemId` | Unique record identifier |
| `_createdAt` | `DateTime` | Record creation timestamp |
| `_updatedAt` | `DateTime` | Last update timestamp |
| `_firstPublishedAt` | `DateTime` | First publication timestamp (null if never published) |
| `_publishedAt` | `DateTime` | Latest publication timestamp |
| `_publicationScheduledAt` | `DateTime` | Scheduled publication date (null if not scheduled) |
| `_unpublishingScheduledAt` | `DateTime` | Scheduled unpublishing date (null if not scheduled) |
| `_isValid` | `BooleanType` | Whether the record passes all validation rules |
| `_modelApiKey` | `String` | The API key of the model this record belongs to |
| `_status` | `ItemStatus` | Record publication status. Without `includeDrafts`, always `published`. With `includeDrafts: true`: `draft` (never published), `published` (published, showing published version), or `updated` (published but has unpublished changes, showing latest draft) |
| `_seoMetaTags` | `[Tag]` | Computed SEO meta tags (see `references/seo-and-meta.md`) |
| `_locales` | `[SiteLocale]` | Which localizations are present on this record (see `references/localization.md`) |

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    id
    title
    _createdAt
    _updatedAt
    _firstPublishedAt
    _status
    _isValid
    _modelApiKey
  }
}
```

## GraphQL Variables

Always use GraphQL variables for dynamic values — **never string interpolation**.

```graphql
query BlogPostBySlug($slug: String!) {
  blogPost(filter: { slug: { eq: $slug } }) {
    id
    title
    content
  }
}
```

```ts
import { executeQuery } from "@datocms/cda-client";

const query = `
  query BlogPostBySlug($slug: String!) {
    blogPost(filter: { slug: { eq: $slug } }) {
      id
      title
      content
    }
  }
`;

const data = await executeQuery(query, {
  token: process.env.DATOCMS_CDA_TOKEN!,
  variables: { slug: "hello-world" },
});
```

**Variable type declarations** use DatoCMS custom scalars where applicable:

- `$first: IntType` — for pagination `first` argument
- `$skip: IntType` — for pagination `skip` argument
- `$id: ItemId` — for record ID filters
- `$slug: String` — for string filters

## Inverse Relationships

When enabled on a model (via "Enable inverse relationships fields in GraphQL?" in model settings), records expose `_allReferencing<ModelName>` fields that return all records from other models that link to this record.

```graphql
query {
  artist(filter: { slug: { eq: "blank-banshee" } }) {
    name
    _allReferencingAlbums {
      id
      title
      releaseDate
    }
    _allReferencingAlbumsMeta {
      count
    }
  }
}
```

### Pagination

Inverse relationships support `first` and `skip`:

```graphql
_allReferencingAlbums(first: 5, skip: 10) {
  id
  title
}
```

### `through` Argument — Filter by Specific Fields

Restrict results to references from specific link fields:

```graphql
_allReferencingBlogPosts(through: { fields: { anyIn: [blogPost_reviewer] } }) {
  id
  title
}
```

For references within blocks, use the nested syntax: `modelApiKey_fieldApiKey__blockModelApiKey_blockFieldApiKey` (e.g., `docPage_main__chapter_author`).

### `through` Argument — Filter by Locale

Restrict to references from specific locales:

```graphql
_allReferencingBlogPosts(through: { locales: { anyIn: [en] } }) {
  id
  title
}
```

Use `_nonLocalized` to match only non-localized field references.

### Ordering and Filtering

```graphql
_allReferencingBlogPosts(
  orderBy: [title_ASC]
  filter: { title: { matches: { pattern: "trip" } } }
) {
  id
  title
}
```

### Block Awareness

Inverse relationships are blocks-aware — they find references inside Modular Content and Structured Text blocks at any nesting depth, not just top-level link fields.

## Complete Example

```ts
import { executeQuery, ApiError } from "@datocms/cda-client";

const query = `
  query BlogPostBySlug($slug: String!) {
    blogPost(filter: { slug: { eq: $slug } }) {
      id
      title
      slug
      _createdAt
      _firstPublishedAt
      _modelApiKey
      author {
        name
      }
      category {
        name
      }
    }
  }
`;

async function fetchBlogPost(slug: string) {
  try {
    const data = await executeQuery(query, {
      token: process.env.DATOCMS_CDA_TOKEN!,
      variables: { slug },
    });

    if (!data.blogPost) {
      console.log("Post not found");
      return null;
    }

    return data.blogPost;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("CDA Error:", error.response.status, error.response.body);
    }
    throw error;
  }
}
```
