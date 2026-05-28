# Filtering

Covers all filter operators by field type, AND/OR logic, meta field filters, deep filtering for modular content and structured text, and upload filtering.

## Contents

- Critical Filter Behaviors
- Filter Syntax
- AND / OR Logic
- Filter Operators by Field Type
- `matches` / `notMatches` Details
- Meta Field Filters
- Deep Filtering
- Upload Queries and Filtering

## Critical Filter Behaviors

**`neq` / `notIn` / `notMatches` return nulls:** Across all field types, negation operators also return records where the field is `null`. For example, `neq: "x"` returns records with a different value **and** records with no value. Add `exists: true` (or `isPresent: true` for string/text fields) if you need to exclude nulls.

**Empty arrays in `in` / `notIn`:** `{ in: [] }` returns an **empty result** (nothing matches). `{ notIn: [] }` returns **all records** (nothing is excluded). Be careful when building filters dynamically — an empty array can produce unexpected results.

## Filter Syntax

Filters are passed as the `filter` argument on collection and single-record queries. Multiple conditions at the same level combine as implicit AND:

```graphql
query {
  allBlogPosts(
    filter: {
      category: { eq: "123" }
      _publishedAt: { gt: "2024-01-01" }
    }
  ) {
    id
    title
  }
}
```

## AND / OR Logic

### Implicit AND

Multiple conditions in the same filter object are ANDed together:

```graphql
filter: {
  title: { matches: { pattern: "hello" } }
  _status: { eq: published }
}
```

### Explicit AND

Use `AND` when you need multiple conditions on the **same field** (since GraphQL object keys must be unique):

```graphql
filter: {
  AND: [
    { name: { matches: { pattern: "Blank" } } }
    { name: { matches: { pattern: "Banshee" } } }
  ]
}
```

### OR

At least one condition must match:

```graphql
filter: {
  OR: [
    { rating: { gt: 4 } }
    { name: { matches: { pattern: "restaurant" } } }
  ]
}
```

### Combined AND + OR

AND and OR can be nested within each other for complex logic:

```graphql
filter: {
  address: { matches: { pattern: "new york" } }
  OR: [
    { rating: { gt: 4 } }
    { name: { matches: { pattern: "restaurant" } } }
  ]
}
```

## Filter Operators by Field Type

### Boolean

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `BooleanType` | Exact match (`true` or `false`) |

### Integer / Float

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `IntType` / `FloatType` | Exact match |
| `neq` | `IntType` / `FloatType` | Not equal (also returns nulls) |
| `lt` | `IntType` / `FloatType` | Less than |
| `lte` | `IntType` / `FloatType` | Less than or equal |
| `gt` | `IntType` / `FloatType` | Greater than |
| `gte` | `IntType` / `FloatType` | Greater than or equal |
| `exists` | `BooleanType` | Field has a value (not null) |

### String (single-line)

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `String` | Exact match |
| `neq` | `String` | Not equal |
| `in` | `[String]` | One of specified values |
| `notIn` | `[String]` | None of specified values |
| `matches` | `{ pattern: String, caseSensitive: Boolean }` | Regex match |
| `notMatches` | `{ pattern: String, caseSensitive: Boolean }` | Regex exclusion |
| `isBlank` | `BooleanType` | `true` = null or empty string; `false` = has content |
| `isPresent` | `BooleanType` | `true` = neither null nor empty |
| `exists` | `BooleanType` | **Deprecated** — use `isBlank` / `isPresent` instead |

### Slug

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `String` | Exact match |
| `neq` | `String` | Not equal |
| `in` | `[String]` | One of specified values |
| `notIn` | `[String]` | None of specified values |

### Text (multi-paragraph)

| Operator | Value Type | Description |
| - | - | - |
| `matches` | `{ pattern: String, caseSensitive: Boolean }` | Regex match |
| `notMatches` | `{ pattern: String, caseSensitive: Boolean }` | Regex exclusion |
| `isBlank` | `BooleanType` | Null or empty |
| `isPresent` | `BooleanType` | Has content |
| `exists` | `BooleanType` | **Deprecated** |

### Date

Format: `"YYYY-MM-DD"`

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `Date` | Exact match |
| `neq` | `Date` | Not equal |
| `lt` | `Date` | Before |
| `lte` | `Date` | Before or on |
| `gt` | `Date` | After |
| `gte` | `Date` | On or after |
| `exists` | `BooleanType` | Field has a value |

### DateTime

Format: `"YYYY-MM-DDTHH:MM:SS+HH:MM"` (ISO 8601 with timezone)

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `DateTime` | Exact match |
| `neq` | `DateTime` | Not equal |
| `lt` | `DateTime` | Before |
| `lte` | `DateTime` | Before or on |
| `gt` | `DateTime` | After |
| `gte` | `DateTime` | On or after |
| `exists` | `BooleanType` | Field has a value |

**Critical gotcha — DateTime truncation:** Seconds and milliseconds are silently truncated to the nearest minute. `gt: "2025-01-01T10:30:45Z"` becomes `gt: "2025-01-01T10:30:00Z"`. This can cause unintended matches. **Mitigation:** add a secondary filter (e.g., `id: { neq: $id }` or `slug: { neq: $slug }`) when querying adjacent records by datetime.

### Single File

Values are Upload IDs (strings).

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `UploadId` | Exact match |
| `neq` | `UploadId` | Not equal |
| `in` | `[UploadId]` | One of specified uploads |
| `notIn` | `[UploadId]` | None of specified uploads |
| `exists` | `BooleanType` | Field has a file |

### Multiple Files (Gallery)

Values are Upload IDs (strings).

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `[UploadId]` | Exact array match |
| `allIn` | `[UploadId]` | Contains ALL specified uploads |
| `anyIn` | `[UploadId]` | Contains at least one specified upload |
| `notIn` | `[UploadId]` | Contains NONE of specified uploads |
| `exists` | `BooleanType` | Field has files |

### Single Link

Values are Record IDs (strings).

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `ItemId` | Exact match |
| `neq` | `ItemId` | Not equal |
| `in` | `[ItemId]` | One of specified records |
| `notIn` | `[ItemId]` | None of specified records |
| `exists` | `BooleanType` | Field has a link |

### Multiple Links

Values are Record IDs (strings).

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `[ItemId]` | Exact array match |
| `allIn` | `[ItemId]` | Linked to ALL specified records |
| `anyIn` | `[ItemId]` | Linked to at least one specified record |
| `notIn` | `[ItemId]` | Linked to NONE of specified records |
| `exists` | `BooleanType` | Field has links |

### Geolocation (Lat/Lon)

| Operator | Value Type | Description |
| - | - | - |
| `near` | `{ latitude: FloatType, longitude: FloatType, radius: FloatType }` | Within radius (in **meters**) |
| `exists` | `BooleanType` | Field has a location |

```graphql
filter: {
  location: {
    near: { latitude: 40.73, longitude: -73.93, radius: 10000 }
  }
}
```

### Color

| Operator | Value Type | Description |
| - | - | - |
| `exists` | `BooleanType` | Field has a color value |

### JSON

| Operator | Value Type | Description |
| - | - | - |
| `exists` | `BooleanType` | Field has a value |

### SEO

| Operator | Value Type | Description |
| - | - | - |
| `exists` | `BooleanType` | Field has SEO data |

### Video

| Operator | Value Type | Description |
| - | - | - |
| `exists` | `BooleanType` | Field has a video |

### Structured Text

| Operator | Value Type | Description |
| - | - | - |
| `matches` | `{ pattern: String, caseSensitive: Boolean }` | Regex match on text content |
| `notMatches` | `{ pattern: String, caseSensitive: Boolean }` | Regex exclusion |
| `isBlank` | `BooleanType` | `true` = null or single empty paragraph |
| `isPresent` | `BooleanType` | Has content |
| `exists` | `BooleanType` | **Deprecated** |

**Note:** When deep filtering is enabled on a structured text field, the filter schema changes — see the Deep Filtering section below.

## `matches` / `notMatches` Details

The `pattern` value is a **regular expression**:

```graphql
filter: {
  title: {
    matches: { pattern: "bi(cycl|k)e", caseSensitive: false }
  }
}
```

`caseSensitive` defaults to `false` if omitted.

## Meta Field Filters

Available on all models:

| Meta Field | Available Operators |
| - | - |
| `id` | `eq`, `neq`, `in`, `notIn` |
| `_createdAt` | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `exists` |
| `_updatedAt` | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `exists` |
| `_publishedAt` | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `exists` |
| `_firstPublishedAt` | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `exists` |
| `_publicationScheduledAt` | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `exists` |
| `_unpublishingScheduledAt` | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `exists` |
| `_status` | `eq`, `neq`, `in`, `notIn` (values: `draft`, `published`, `updated`) — `updated` means published with unpublished changes, only visible when `includeDrafts: true` |
| `_isValid` | `eq` |
| `parent` | `eq`, `exists` (tree models only) |
| `position` | `eq`, `neq`, `lt`, `lte`, `gt`, `gte` (sortable/tree models only) |

### Locale Filter

| Meta Field | Available Operators |
| - | - |
| `_locales` | `allIn`, `anyIn`, `notIn` |

```graphql
filter: {
  _locales: { anyIn: [it, en] }
}
```

## Deep Filtering

Deep filtering allows filtering records based on the content of their Modular Content or Structured Text blocks. It must be **explicitly enabled per field** in the DatoCMS admin.

**Complexity warning:** Deep filtering adds **1,000,000 per block model type** to query complexity. Use sparingly.

### Modular Content Deep Filtering

#### `any` operator

Filters records containing at least one block matching the conditions:

```graphql
query {
  allBlogPosts(
    filter: {
      content: {
        any: {
          product: { name: { eq: "T-Shirt" }, price: { gt: 30 } }
        }
      }
    }
  ) {
    id
    title
  }
}
```

When multiple block types are specified inside `any`, they combine with AND logic — the record must contain at least one matching block of **each** specified type.

For OR logic between block conditions, wrap in a top-level `OR`:

```graphql
filter: {
  OR: [
    { content: { any: { product: { name: { eq: "T-Shirt" } } } } }
    { content: { any: { hero: { title: { matches: { pattern: "offer" } } } } } }
  ]
}
```

#### `exists` operator

```graphql
filter: {
  content: { exists: true }   # has at least one block
}
```

#### `containsAny` operator

Filters by block type presence/absence:

```graphql
filter: {
  content: {
    containsAny: { product: true, hero: false }
  }
}
```

This returns records containing at least one `product` block AND containing no `hero` blocks. Conditions between block types use AND logic.

### Structured Text Deep Filtering

**Breaking change:** When deep filtering is enabled on a Structured Text field, text-based filters move inside a `value` key, and block filters go under a `blocks` key.

**Without** deep filtering enabled:

```graphql
filter: {
  structuredTextField: {
    matches: { pattern: "bicycle", caseSensitive: false }
  }
}
```

**With** deep filtering enabled:

```graphql
filter: {
  structuredTextField: {
    value: {
      matches: { pattern: "bicycle", caseSensitive: false }
    }
    blocks: {
      any: { cta: { title: { eq: "Subscribe!" } } }
    }
  }
}
```

### Deep Filtering Limitations

1. **One level deep only.** Cannot filter on blocks nested within other blocks.
2. **Block meta fields:** Blocks only have `id` as a meta field — no `_createdAt`, `_publishedAt`, etc.
3. **CDA only.** Deep filtering is not available in the CMA REST API.

## Upload Queries and Filtering

`allUploads` and `upload` (single upload by ID) are standalone root-level queries for browsing the media library. They support pagination (`first`/`skip`), ordering, and `_allUploadsMeta { count }` for totals.

Single upload by ID:

```graphql
query {
  upload(filter: { id: { eq: "12345" } }) {
    url
    filename
    mimeType
    alt
    title
    width
    height
  }
}
```

The `allUploads` query supports its own set of filters:

```graphql
query {
  allUploads(filter: { type: { eq: image } }) {
    url
    filename
  }
}
```

### Upload Filter Fields

#### Enum Fields

| Field | Operators | Values |
| - | - | - |
| `type` | `eq`, `neq`, `in`, `notIn` | `image`, `video` (unquoted enums) |
| `resolution` | `eq`, `neq`, `in`, `notIn` | `icon`, `small`, `medium`, `large` |
| `orientation` | `eq`, `neq` | `landscape`, `portrait`, `square` |

#### String Fields

Not all upload string fields support the same operators:

| Field | Supported Operators |
| - | - |
| `alt`, `title` | `matches`, `notMatches`, `eq`, `neq`, `in`, `notIn`, `exists` |
| `mimeType` | `matches`, `notMatches`, `eq`, `neq`, `in`, `notIn` |
| `author`, `copyright`, `notes` | `matches`, `notMatches`, `exists` |
| `basename`, `filename` | `matches`, `notMatches` |

Operator value types: `matches`/`notMatches` take `{ pattern: String, caseSensitive: Boolean }`, `eq`/`neq` take `String`, `in`/`notIn` take `[String]`, `exists` takes `BooleanType`.

#### Numeric Fields: `height`, `width` (pixels), `size` (bytes)

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `IntType` | Exact match |
| `neq` | `IntType` | Not equal |
| `gt` | `IntType` | Greater than |
| `lt` | `IntType` | Less than |
| `gte` | `IntType` | Greater than or equal |
| `lte` | `IntType` | Less than or equal |

#### Array/Tag Fields: `tags`, `smartTags`, `colors`

| Operator | Value Type | Description |
| - | - | - |
| `contains` | `String` | Contains the specified value |
| `allIn` | `[String]` | Contains ALL specified values |
| `anyIn` | `[String]` | Contains at least one specified value |
| `notIn` | `[String]` | Contains NONE of specified values |
| `eq` | `[String]` | Exact array match |

#### DateTime Fields: `_createdAt`, `_updatedAt`

| Operator | Value Type | Description |
| - | - | - |
| `eq` | `DateTime` | Exact match |
| `neq` | `DateTime` | Not equal |
| `lt` | `DateTime` | Less than |
| `lte` | `DateTime` | Less than or equal |
| `gt` | `DateTime` | Greater than |
| `gte` | `DateTime` | Greater than or equal |

Same minute-truncation gotcha as record DateTime filters.

#### Special Fields

| Field | Operators | Value Type |
| - | - | - |
| `id` | `eq`, `neq`, `in`, `notIn` | `UploadId` |
| `md5` | `eq`, `neq`, `in`, `notIn` | `String` |
| `path` | `eq`, `neq`, `in`, `notIn` | `String` |
| `format` | `eq`, `neq`, `in`, `notIn` | `String` |
| `inUse` | `eq` | `BooleanType` (whether the upload is referenced by any record) |

### Upload Filtering with OR

```graphql
query {
  allUploads(
    filter: {
      OR: [
        { type: { eq: image }, resolution: { eq: large } }
        { type: { eq: video }, tags: { contains: "promo" } }
      ]
    }
  ) {
    url
    filename
  }
}
```
