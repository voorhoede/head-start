# Client Setup and Error Handling

This reference is always loaded. It covers package selection, `buildClient()` setup, token and environment configuration, and the error types to handle in CMA code.

> **Scope:** `buildClient()` is for **unattended runtime** code (CI, app server, webhook, long-lived automation, repo-committed scripts) — that is the scenario where you need a CMA token in the environment and you construct the client yourself. Interactive one-offs go through `cma:call` or `cma:script` (stdin-mode or file-mode), where the client is either absent or handed to you as `client` (ambient in stdin-mode, default-export parameter in file-mode and migrations) — the configuration options and error types below still apply, you just don't call `buildClient()` yourself.

## Contents

- Package Selection
- Building the Client
- Common Resources
- Error Handling

## Package Selection

| Package | Runtime | When to use |
| - | - | - |
| `@datocms/cma-client` | Universal | Recommended for most cases. Works anywhere with native `fetch`. Only provide `fetchFn` if the runtime lacks it. |
| `@datocms/cma-client-node` | Node.js | Use when you need Node.js upload helpers such as `createFromLocalFile()` or `createFromUrl()`. |
| `@datocms/cma-client-browser` | Browser | Use when you need browser upload helpers such as `createFromFileOrBlob()`. |

All three packages expose the same core CMA resources. The main differences are the environment-specific upload convenience methods.

Install with:

```bash
npm install @datocms/cma-client-node
```

## Building the Client

```ts
import { buildClient } from "@datocms/cma-client-node";

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN!,
});
```

### Common `ClientConfigOptions`

| Option | Type | Default | Description |
| - | - | - | - |
| `apiToken` | `string \| null` | — | Required. Use a CMA-capable token with the permissions your task needs. |
| `environment` | `string` | — | Targets a sandbox environment. Omit to use the primary environment. |
| `requestTimeout` | `number` | `30000` | Timeout in milliseconds per request. |
| `autoRetry` | `boolean` | `true` | Retries rate limits and transient server failures automatically. |
| `logLevel` | `LogLevel` | `LogLevel.NONE` | Logging verbosity. |
| `logFn` | `(message: string) => void` | `console.log` | Custom log function. |
| `extraHeaders` | `Record<string, string>` | — | Additional headers for every request. |
| `fetchFn` | `typeof fetch` | — | Custom fetch implementation for runtimes without native fetch. |

**Token guidance:**

- CMA operations require `can_access_cma: true`
- Schema changes require a role with `can_edit_schema: true`
- Public browser tokens or read-only CDA tokens are not sufficient for CMA writes

## Common Resources

| Resource | Property | Common operations |
| - | - | - |
| Records | `client.items` | CRUD, publish, unpublish, bulk operations |
| Uploads | `client.uploads` | CRUD, bulk tag/destroy, references |
| Models | `client.itemTypes` | CRUD, duplicate, referencing |
| Fields | `client.fields` | CRUD, duplicate, referencing |
| Environments | `client.environments` | Fork, promote, rename, destroy |
| Webhooks | `client.webhooks` | CRUD |
| Build triggers | `client.buildTriggers` | CRUD, trigger, abort |
| Roles | `client.roles` | CRUD, duplicate |
| API tokens | `client.accessTokens` | CRUD, regenerate |
| Workflows | `client.workflows` | CRUD |
| Site | `client.site` | Find and update site settings (locales, timezone, global SEO) |
| Menu items | `client.menuItems` | CRUD, organize dashboard navigation |
| Schema menu items | `client.schemaMenuItems` | CRUD, organize schema sidebar |
| Plugins | `client.plugins` | CRUD, list fields using a plugin |
| Maintenance mode | `client.maintenanceMode` | Find, activate, deactivate |
| Record filters | `client.itemTypeFilters` | CRUD for saved record list filters |
| Upload filters | `client.uploadFilters` | CRUD for saved upload filters |
| Upload tracks | `client.uploadTracks` | Create, list, destroy video subtitle tracks |
| Upload tags | `client.uploadTags` | List, create manual asset tags |
| Job results | `client.jobResults` | Find async job status (usually auto-polled) |
| Audit log | `client.auditLogEvents` | Query events with filters |
| Subscription limits | `client.subscriptionLimits` | List plan limits and current usage |
| Search results | `client.searchResults` | CMA-side site search |

The client also exposes resources for record versions, webhook calls, SSO, daily usage, subscription features, white-label settings, and more.

> **Tip:** When the `datocms` npm package is installed, run `npx datocms cma:docs <resource> <action>` to browse detailed, up-to-date endpoint documentation (request body schemas, required fields, parameters, examples) directly in the terminal.

## Error Handling

### `ApiError`

Thrown when the API returns a non-2xx response other than rate limits that are retried automatically.

```ts
import { ApiError } from "@datocms/cma-client-node";

try {
  await client.items.create({
    item_type: { id: "model_123", type: "item_type" },
    title: "Hello",
  });
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.response.status);
    console.log(error.errors);

    const uniqueError = error.findError("VALIDATION_UNIQUE");
    if (uniqueError) {
      console.log(uniqueError.attributes.details);
    }
  }
  throw error;
}
```

**Useful `ApiError` members:**

| Property | Type | Description |
| - | - | - |
| `request` | `{ url, method, headers, body? }` | The failed request |
| `response` | `{ status, statusText, headers, body? }` | The API response |
| `errors` | `ErrorEntity[]` | Parsed DatoCMS error entities |
| `findError()` | method | Finds errors by code and optional detail filters |

### `TimeoutError`

Thrown when a request exceeds `requestTimeout` and retries do not recover.

```ts
import { TimeoutError } from "@datocms/cma-client-node";

try {
  await client.items.list();
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log("Request timed out:", error.request.url);
  }
}
```
