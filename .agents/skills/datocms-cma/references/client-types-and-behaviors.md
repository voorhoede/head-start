# Client Types and Runtime Behaviors

Load this reference when the task uses `raw*()` methods, generated CMA types, advanced client behavior, platform limits, or site-level metadata.

## Contents

- The Dual API Surface
- Type System
- Automatic Behaviors
- Technical Limits
- Getting Site Information

## The Dual API Surface

Every resource method exists in two forms:

- **Simplified**: `client.items.create(body)` uses friendly attribute-based objects and handles serialization automatically
- **Raw**: `client.items.rawCreate(body)` uses the JSON:API shape directly

Prefer the simplified API unless you specifically need raw JSON:API payloads or metadata such as relationship includes or `meta.total_count`.

```ts
const record = await client.items.create({
  item_type: { id: "model_123", type: "item_type" },
  title: "Hello World",
  slug: "hello-world",
});

console.log(record.id);
console.log(record.title);
```

### JSON:API Payload Structure

The raw API methods exchange payloads conforming to the JSON:API specification. Every raw request and response body follows this shape:

```ts
const rawPayload = {
  data: {
    type: "item",
    id: "record_123",
    attributes: {
      title: "Hello World",
      slug: "hello-world",
    },
    relationships: {
      item_type: {
        data: { type: "item_type", id: "model_123" },
      },
      creator: {
        data: { type: "account", id: "account_456" },
      },
    },
    meta: {
      created_at: "2025-01-15T10:00:00.000+00:00",
      updated_at: "2025-01-15T12:30:00.000+00:00",
      published_at: "2025-01-15T12:30:00.000+00:00",
      status: "published",
      current_version: "version_789",
      is_valid: true,
    },
  },
};
```

**Important:** The simplified API flattens this structure so you work with `record.title` directly instead of `record.data.attributes.title`. The raw API preserves the full JSON:API envelope.

### Raw Method Examples

**`rawCreate()` — full JSON:API body with type, attributes, and relationships:**

```ts
const rawResponse = await client.items.rawCreate({
  data: {
    type: "item",
    attributes: {
      title: "New Article",
      slug: "new-article",
      body: "Article content here.",
    },
    relationships: {
      item_type: {
        data: { type: "item_type", id: "model_123" },
      },
    },
  },
});

const recordId = rawResponse.data.id;
const recordTitle = rawResponse.data.attributes.title;
```

**`rawUpdate()` — partial update with JSON:API payload:**

```ts
const rawUpdated = await client.items.rawUpdate("record_123", {
  data: {
    type: "item",
    id: "record_123",
    attributes: {
      title: "Updated Title",
    },
    meta: {
      current_version: "version_789",
    },
  },
});
```

**`rawList()` — accessing `meta.total_count` and pagination metadata:**

```ts
const rawListResponse = await client.items.rawList({
  filter: { type: "model_123" },
  page: { limit: 0 },
});

const totalRecords = rawListResponse.meta.total_count;
```

**Important:** Setting `page.limit: 0` returns zero records but still includes `meta.total_count`, which is useful for counting without fetching data.

```ts
const rawPage = await client.items.rawList({
  filter: { type: "model_123" },
  page: { offset: 0, limit: 30 },
});

const records = rawPage.data;
const totalCount = rawPage.meta.total_count;
```

**`rawFind()` — with query params:**

```ts
const rawRecord = await client.items.rawFind("record_123", {
  nested: true,
  version: "published",
});

const rawRecordAttributes = rawRecord.data.attributes;
const rawRecordRelationships = rawRecord.data.relationships;
```

### When to Use Raw vs Simplified

| Scenario | Use |
| - | - |
| Standard CRUD operations | Simplified |
| Need `meta.total_count` without fetching records | Raw (`rawList` with `page.limit: 0`) |
| Working with generated CMA types on the raw path | Raw |
| Need relationship includes or response metadata | Raw |
| Migration/export needing full JSON:API payloads | Raw |
| Everything else | Simplified |

## Type System

```ts
import type { ApiTypes } from "@datocms/cma-client-node";
```

The `ApiTypes` namespace contains the simplified API types. Common ones include:

- `ApiTypes.Item`
- `ApiTypes.ItemCreateSchema`
- `ApiTypes.ItemUpdateSchema`
- `ApiTypes.ItemType`
- `ApiTypes.Field`
- `ApiTypes.Upload`
- `ApiTypes.Webhook`
- `ApiTypes.Role`
- `ApiTypes.Environment`
- `ApiTypes.AccessToken`
- `ApiTypes.Workflow`

The `RawApiTypes` namespace contains the JSON:API equivalents for `raw*()` methods.

Many methods accept an optional generic `D extends ItemTypeDefinition` for per-model type safety. Use this when the project intentionally relies on generated CMA schema types.

**Legacy aliases:** `SimpleSchemaTypes = ApiTypes`, `SchemaTypes = RawApiTypes`. Prefer `ApiTypes` and `RawApiTypes` in new code.

See `references/type-generation.md` for generating the project's `cma-types.ts` (the `Schema.X` markers used as generics throughout this skill).

### Looking up a specific type

For the exact, up-to-date shape of any `ApiTypes.*` / `RawApiTypes.*` type, run `npx datocms cma:docs <resource> <action>`. To print just one specific type declaration on its own, use `--expand-types <TypeName>` (e.g. `--expand-types ItemCreateSchema`) — this suppresses the docs/methods sections and emits only the type. To extend the integrated "Not expanded" type list that ships with the regular docs view, raise `--types-depth` (default 2) to 3 or higher. Reach for `--expand-types "*"` only as a last resort — its output is verbose and `--types-depth` does not constrain it. For the full command surface, load the **datocms-cli** skill and read `../../datocms-cli/references/direct-cma-calls.md` § cma:docs — that is the single source of truth.

## Automatic Behaviors

### Rate Limit Retry

When `autoRetry` is `true` (the default), the client automatically retries 429 responses with linear incremental backoff. Do not add your own rate-limit retry loop unless you have a very specific reason.

### Transient Error Retry

Transient server errors (5xx with `transient: true`) are also retried automatically when `autoRetry` is enabled.

## Technical Limits

| Limit | Value |
| - | - |
| Max record size | 300 KB including nested blocks, excluding assets and linked records |
| Max blocks per record | 500 |
| Max nested block depth | 5 levels |
| Max upload size | 1 GB per asset |
| Rate limit | 60 requests per 3 seconds |
| Bulk operation batch | 200 items per request |

Exceeding these typically triggers `TECHNICAL_LIMIT_REACHED` or `TOO_MANY_OPERATIONS`.

## Getting Site Information

Use the site resource when you need locales, timezone, or other project-level settings before mutating data:

```ts
const site = await client.site.find();

console.log(site.locales);
console.log(site.name);
```
