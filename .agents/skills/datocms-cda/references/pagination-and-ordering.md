# Pagination and Ordering

Covers offset pagination, auto-pagination for large collections, ordering, tree/hierarchical models, and query complexity costs.

## Contents

- Offset Pagination
- Getting Total Count
- `executeQueryWithAutoPagination()`
- Ordering
- Tree / Hierarchical Models
- Complexity Cost Reference

## Offset Pagination

Collection queries accept `first` and `skip` arguments:

| Argument | Type | Default | Maximum |
| - | - | - | - |
| `first` | `IntType` | 20 | 500 |
| `skip` | `IntType` | 0 | — |

```graphql
query {
  allBlogPosts(first: 10, skip: 20) {
    id
    title
  }
}
```

## Getting Total Count

Use the meta query (`_all<PluralModel>Meta`) to get the total count. **Apply the same filters as the collection query.**

```graphql
query ($first: IntType, $skip: IntType) {
  allBlogPosts(first: $first, skip: $skip) {
    id
    title
  }
  _allBlogPostsMeta {
    count
  }
}
```

## `executeQueryWithAutoPagination()`

When you need to fetch **more than 500 records**, use `executeQueryWithAutoPagination`. It rewrites your query into a **single GraphQL request** containing multiple aliased selections (each fetching up to 500 records with different `skip` offsets) and merges the results client-side.

```ts
import { executeQueryWithAutoPagination } from "@datocms/cda-client";

const query = `
  query {
    allBlogPosts(first: 2000) {
      id
      title
    }
  }
`;

const data = await executeQueryWithAutoPagination(query, {
  token: process.env.DATOCMS_CDA_TOKEN!,
});

// data.allBlogPosts contains all 2000 records
```

**Complexity warning:** Because all aliased selections are in one query, the complexity cost multiplies. A `first: 2000` query becomes 4 aliased selections of 500 each — roughly 4x the complexity of a single page. Keep inner field selections minimal when fetching large collections, or you may exceed the 10M complexity limit.

**Limitation: only ONE paginated collection per query.** If the query contains multiple collections with oversized `first` arguments, the function throws an error. Split into separate queries.

There is also `rawExecuteQueryWithAutoPagination` which returns `[Result, Response]` for accessing response headers.

## Ordering

Use the `orderBy` argument with format `fieldApiKey_ASC` or `fieldApiKey_DESC`. Pass an array for multiple sort fields:

```graphql
query {
  allBlogPosts(orderBy: [publishedDate_DESC, title_ASC]) {
    id
    title
    publishedDate
  }
}
```

### Orderable Meta Fields

| Meta Field | Example |
| - | - |
| `_createdAt` | `_createdAt_DESC` |
| `_updatedAt` | `_updatedAt_DESC` |
| `_publishedAt` | `_publishedAt_DESC` |
| `_firstPublishedAt` | `_firstPublishedAt_DESC` |
| `_publicationScheduledAt` | `_publicationScheduledAt_ASC` |
| `_unpublishingScheduledAt` | `_unpublishingScheduledAt_ASC` |
| `_status` | `_status_ASC` |
| `_isValid` | `_isValid_ASC` |
| `position` | `position_ASC` (sortable/tree models only) |

Any scalar field on the model can also be used for ordering.

## Tree / Hierarchical Models

Models with tree sorting enabled expose `parent` and `children` fields.

### Fetching Root Items

Filter for records with no parent:

```graphql
query {
  allCategories(
    filter: { parent: { exists: false } }
    orderBy: [position_ASC]
  ) {
    id
    name
    children {
      id
      name
      children {
        id
        name
      }
    }
  }
}
```

### Key Points

- `parent` returns the parent record (or null for root items)
- `children` returns an array of direct descendants
- Nest `children` selections to the desired depth
- Use `position_ASC` ordering to maintain the manual sort order from the DatoCMS UI
- Filter a specific parent's children: `filter: { parent: { eq: "parent-record-id" } }`

## Complexity Cost Reference

Every query has a complexity cost that must stay under **10,000,000**. Response headers `X-Complexity` and `X-Max-Complexity` report the actual and maximum values.

When a query exceeds the complexity limit, the API returns an error:

```json
{
  "errors": [{
    "message": "Query has complexity of xxx, which exceeds max complexity of yyy"
  }]
}
```

### Root Query Costs

| Query Type | Base Cost | Formula |
| - | - | - |
| Collection (`allXXX`) | 100 | 100 + (filters x 250) + (sorts x 250) + (page_size x inner_field_costs) |
| Single record (`xxx`) | 50 | 50 + (filters x 250) + inner_field_costs |
| Single-instance model | 25 | 25 + inner_field_costs |
| Meta count (`_allXXXMeta`) | 1,000 | 1,000 + (filters x 250) + inner_field_costs |
| Inverse relationship | 100 | 100 + (filters x 250) + (sorts x 250) + (page_size x inner_field_costs) |
| Inverse relationship meta | 1,000 | 1,000 + (filters x 250) + inner_field_costs |
| `_site` | 10 | 10 + inner_field_costs |
| Upload collection (`allUploads`) | 100 | 100 + (filters x 250) + (sorts x 250) + (page_size x inner_field_costs) |
| Single upload (`upload`) | 50 | 50 + (filters x 250) + inner_field_costs |
| Upload meta (`_allUploadsMeta`) | 1,000 | 1,000 + (filters x 250) + inner_field_costs |

Default page size for collections is 20. Page size = `first` argument value.

### Field Type Costs

| Field Type | Cost |
| - | - |
| Standard scalar (string, number, boolean, etc.) | 1 |
| Single asset field | 5 |
| Asset gallery | 5 x inner field costs |
| Multi-paragraph text (Markdown → HTML) | 5 |
| JSON field | 5 |
| Single link | 10 |
| Multiple links | 5 x inner field costs |
| Modular content | 5 x inner field costs |
| Structured text `value` | 10 |
| Structured text `blocks` | 5 x inner field costs |
| Structured text `links` | 5 x inner field costs |
| Tree `children` | 5 x inner field costs |
| Tree `parent` | 25 |
| SEO image | 5 |
| `_seoMetaTags` | 5 |
| `blurUpThumb` (on uploads) | 5 |
| `responsiveImage` sub-selection | 5 |

### Additional Cost Factors

| Factor | Cost |
| - | - |
| Each filter condition | +250 |
| Each sort field | +250 |
| Localized field multiplier | (number of project locales) x inner field costs |
| Union type fields | Maximum cost among all possible union variants |
| Deep filtering per block model type | +1,000,000 |

### Strategies to Stay Under 10M

- Request only the fields you actually need
- Use small `first` values — avoid `first: 500` unless necessary
- Minimize filter and sort conditions
- Avoid deeply nested `responsiveImage` queries inside large collections
- Split large queries into multiple smaller queries
- Use `_allXXXMeta { count }` instead of fetching records just to count them
- Be very cautious with deep filtering — each block type adds 1,000,000 to complexity

### Complexity Calculation Examples

**Simple collection query (cost: 140):**

```graphql
query {
  allArtists {
    id
    name
  }
}
```

Breakdown: 100 (collection base) + 20 (default page size) x 2 (inner fields) = 140

**Collection with filters, sorting, and custom page size (cost: 1,175):**

```graphql
query {
  allArtists(
    filter: {
      birth: { gt: "1990-01-01", lt: "2010-01-01" },
      country: { eq: "DE" }
    },
    orderBy: [name_ASC],
    first: 25
  ) {
    id
    name
    age
  }
}
```

Breakdown: 100 (base) + 750 (3 filter conditions x 250) + 250 (1 sort x 250) + 25 x 3 (page size x inner fields) = 1,175

**Single record with relational fields (cost: 351):**

```graphql
query {
  artist(filter: { id: { eq: "123" } }) {
    photo {
      url
      blurUpThumb
    }
    content {
      value
      links {
        id
      }
      blocks {
        id
        text
      }
    }
    movies {
      id
      title
      releaseDate
    }
  }
}
```

Breakdown: 50 (single record base) + 250 (filter) + 5 + 1 + 5 (photo: asset + url + blurUpThumb) + 10 + 5x1 + 5x2 (structured text: value + links + blocks) + 5x3 (multiple links: movies) = 351

**Deep filtering query (cost: 2,000,890):**

```graphql
query {
  allBlogPosts(
    filter: {
      content: {
        any: {
          product: { name: { eq: "T-Shirt" }, price: { gt: 30 } }
          cta: { title: { isPresent: true } }
        }
      }
    }
  ) {
    id
    title
  }
}
```

Breakdown: 100 (base) + 2,000,000 (2 block types x 1,000,000) + 750 (3 filter args x 250) + 20 x 2 (page size x fields) = 2,000,890
