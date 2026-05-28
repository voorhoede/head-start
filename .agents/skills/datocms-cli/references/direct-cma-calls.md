# Direct CMA Calls

Use `cma:call` for single-method CMA operations from terminal. Reusable script overkill? Use this.

Command surface **dynamic**: resources/methods match installed `@datocms/cma-client` version. Always discover first — never guess.

> **Related:** Multi-step/typed/looping/branching/dependent calls? Use `cma:script` — stdin-mode for heredocs/pipes, file-mode for longer scratch scripts. See `cma-script.md`.

## Contents

- Inputs to confirm before running commands
- Command Shape
- Resource and Method Discovery
- Operation Safety Levels
- Path Arguments
- JSON5 Support for --data and --params
- Core Patterns by Example
- Commonly Used Resources
- Pagination
- Output and Scripting
- When to Escalate

## Inputs to confirm before running commands

Unsure about request shape? Run `npx datocms cma:docs <resource> <action>` first.

Pick tool:

- **`cma:call`** — single call, shape from `cma:docs`. Fastest path, most discoverable.
- **`cma:script` stdin-mode** — one-off needs loops/branching/dependent calls/typed `Schema.*`. Piped/heredoc, ambient `client`/`Schema`, zero setup. See `cma-script.md`.
- **`cma:script` file-mode** — throwaway but too long for heredoc, needs imports, or rerunnable by filename. Gitignored scratch dir.
- **Migration** — commit/version/replay across environments? `migrations:new`.
- **Checked-in `buildClient()` script (datocms-cma)** — unattended runtime (CI/app server/webhook/automation) needs env token.

Confirm:

- resource + method (`cma:call`) or script scope (`cma:script`)
- required positional path args (`cma:call`)
- needs `--data`, `--params`, `--environment`?
- read-only (safe), mutating (confirm env), or destructive (always confirm target)
- one-off CLI or reusable CMA code

## Command Shape

```bash
npx datocms cma:call <resourceCamelCase> <methodCamelCase> [...pathArgs] [--data '...'] [--params '...'] [--environment <env>]
```

### Flags

| Flag | Description |
| - | - |
| `--data <value>` | JSON/JSON5 string for request body (create/update) |
| `--params <value>` | JSON/JSON5 string for query params (filtering, pagination) |
| `-e, --environment <value>` | Target specific environment |
| `--json` | Machine-readable JSON output (piping) |
| `--api-token <value>` | Override API token for this call |
| `--profile <value>` | Use specific CLI profile |
| `--log-level <level>` | NONE, BASIC, BODY, or BODY_AND_HEADERS |

## Resource and Method Discovery

### `cma:docs` — Browse full API reference

Use `cma:docs` for detailed, up-to-date terminal docs. Always matches installed client — never stale.

```bash
# List all available resources
npx datocms cma:docs

# Describe a resource and its actions
npx datocms cma:docs items

# Describe a specific action — description, HTTP, client method signatures
npx datocms cma:docs items create

# Expand a collapsed example section (pass `*` to expand all)
npx datocms cma:docs items create --expand-details "Example: Basic example"

# Print only TS declarations for every reachable referenced type (suppresses docs/methods sections)
npx datocms cma:docs items create --expand-types "*"

# Print only declarations for specific named types (suppresses docs/methods sections; repeatable)
npx datocms cma:docs items create --expand-types ItemCreateSchema

# Raise the walk depth for the integrated "Not expanded" type list (default: 2)
npx datocms cma:docs items create --types-depth 4
```

| Flag | Description |
| - | - |
| `--expand-details <summary>` | Expand collapsed `<details>` by summary text (repeatable). `*` expands all. Long sections (>2000 chars) auto-collapse otherwise |
| `--expand-types <name>` | Print only TS declarations for referenced types — suppresses all other output. `*` for everything reachable, or specific names (repeatable) |
| `--types-depth <n>` | Walk depth for the integrated "Not expanded" type list (default 2). No effect with `--expand-types "*"`, which has no depth limit |

**Resource names camelCase** in `cma:docs`, matching JS client: `itemTypes` (not `item_types`), `scheduledPublication`, `uploadSmartTags`, `buildTriggers`, `auditLogEvents`. Same camelCase on client (`client.itemTypes.create`, etc.). Unsure? Run `npx datocms cma:docs` (no args) for full list.

Writing typed mutations? Raise `--types-depth` past the default of 2 for a deeper integrated type list, or pass `--expand-types <SpecificType>` to print just that type's declaration on its own (rest of the docs is suppressed). `--expand-types "*"` is verbose — last resort.

Recommended way to look up: request body schemas, required fields, query params, response shapes, TS signatures before constructing `cma:call` or CMA client code.

### `cma:call --help` — Quick resource/method listing

```bash
# List all available resources
npx datocms cma:call --help

# List all methods for a specific resource
npx datocms cma:call <resourceCamelCase> --help
```

CLI suggests valid options when resource/method not found.

### Naming Convention

Prefer **camelCase** in examples (`itemTypes`, `accessTokens`, `bulkPublish`) — matches JS CMA client namespace exactly (`client.itemTypes.create`). `cma:call` also accepts snake_case (`item_types`), bare (`itemtypes`), case-insensitive, ignores underscores/hyphens — but stick to camelCase for consistency with `cma:docs` and client code.

## Operation Safety Levels

Every `cma:call` is one category. Classify intent first.

### Read-only (safe — no confirmation needed)

Never modifies data:

- `list`, `find`, `references`, `related`, `referencing`, `query`
- `fields` (plugins — lists fields using plugin)
- `findMe` (users)
- `maintenanceMode find`, `site find`, `publicInfo find`

### Mutating (reversible — confirm target environment)

Creates/modifies data, typically undoable:

- `create`, `update`, `duplicate`, `publish`, `unpublish`
- `bulkPublish`, `bulkUnpublish`, `bulkMoveToStage`
- `activate`, `deactivate` (maintenance mode)
- `trigger`, `abort`, `reindex` (build triggers)
- `reorder` (menu items, schema menu items, upload collections)
- `resend` (invitations), `resendWebhook` (webhooks)
- `regenerateToken` (access tokens — old token stops working)

### Destructive (irreversible — always confirm first)

Permanently deletes or replaces environments:

- `destroy` on any resource (`items`, `itemTypes`, `fields`, `uploads`, `environments`, `roles`, `webhooks`, `accessTokens`, `plugins`, etc.)
- `bulkDestroy` (`items`, `uploads`)
- `environments promote` (replaces current primary)
- `environments rename` (may break old ID references)

### Schema changes need approach decision first

`create`/`update`/`destroy` on `itemTypes`, `fields`, `fieldsets`, or block models = **schema changes**. Before proposing `cma:call`, confirm:

- Migration script (default) or direct `cma:call`?
- If direct: sandbox or primary?
- Skipping migration = no review, no dry-run, no reproducibility. Direct primary changes need explicit user confirmation.

## Path Arguments

Some methods need positional args after method name. Map to URL placeholders.

```bash
# find / update / destroy require the entity ID
npx datocms cma:call items find <ITEM_ID>
npx datocms cma:call items update <ITEM_ID> --data '{title: "Updated"}'

# Nested resources need the parent ID
npx datocms cma:call fields list <ITEM_TYPE_ID>
npx datocms cma:call fields create <ITEM_TYPE_ID> --data '{label: "Title", api_key: "title", field_type: "string"}'

# Some need both parent and entity ID
npx datocms cma:call fields update <ITEM_TYPE_ID> <FIELD_ID> --data '{label: "New Label"}'
npx datocms cma:call uploadTracks create <UPLOAD_ID> --data '{...}'
```

CLI validates arg count, shows required placeholder names on mismatch.

## JSON5 Support for --data and --params

Both accept **JSON5** — more shell-friendly than strict JSON:

```bash
# JSON5: unquoted keys (avoids shell quote escaping)
npx datocms cma:call roles create --data '{name: "Editor", can_edit_site: true}'

# Strict JSON also works
npx datocms cma:call roles create --data '{"name": "Editor", "can_edit_site": true}'
```

JSON5 allows: unquoted keys, trailing commas, single-quoted strings, comments.

### Shell Quoting

Wrap `--data`/`--params` in **single quotes** to prevent shell interpolation. Double quotes only inside JSON:

```bash
# Correct — single quotes outside
npx datocms cma:call items create --data '{item_type: {type: "item_type", id: "blog_post"}, title: "Hello"}'
```

## Core Patterns by Example

Four patterns cover most `cma:call` usage. Resources/fields change, shapes consistent across all 44.

### Pattern 1: List + filter + paginate (read-only)

```bash
# Simple list
npx datocms cma:call itemTypes list

# Filter by model type
npx datocms cma:call items list --params '{filter: {type: "blog_post"}}'

# Paginate (offset-based)
npx datocms cma:call items list --params '{page: {offset: 0, limit: 30}}'

# Target a sandbox environment
npx datocms cma:call items list --environment=staging
```

### Pattern 2: Find / inspect single entity (read-only)

```bash
npx datocms cma:call items find <ITEM_ID>
npx datocms cma:call itemTypes find <ITEM_TYPE_ID>
npx datocms cma:call uploads references <UPLOAD_ID>
npx datocms cma:call site find
```

### Pattern 3: Create / update with --data (mutating)

```bash
# Create — path args for parent if nested, --data for the body
npx datocms cma:call itemTypes create --data '{name: "Author", api_key: "author"}'
npx datocms cma:call fields create <ITEM_TYPE_ID> --data '{label: "Name", api_key: "name", field_type: "string"}'
npx datocms cma:call items create --data '{item_type: {type: "item_type", id: "blog_post"}, title: "New Post"}'

# Update — entity ID as path arg, changed fields in --data
npx datocms cma:call items update <ITEM_ID> --data '{title: "Updated Title"}'
npx datocms cma:call roles update <ROLE_ID> --data '{name: "Senior Editor"}'

# Publish / unpublish
npx datocms cma:call items publish <ITEM_ID>
npx datocms cma:call items unpublish <ITEM_ID>
```

### Pattern 4: Bulk operations with --data (mutating/destructive)

```bash
# Bulk publish (mutating)
npx datocms cma:call items bulkPublish --data '{items: [{type: "item", id: "123"}, {type: "item", id: "456"}]}'

# Bulk tag uploads (mutating)
npx datocms cma:call uploads bulkTag --data '{uploads: [{type: "upload", id: "789"}], tags: ["hero"]}'

# Bulk destroy (DESTRUCTIVE — confirm first)
npx datocms cma:call items bulkDestroy --data '{items: [{type: "item", id: "123"}]}'
```

Bulk payloads use relationship arrays: `{items: [{type: "item", id: "..."}]}`.

## Commonly Used Resources

44 resources available. Run `npx datocms cma:call --help` for current list. Most frequent:

| Resource | Key methods | Path args |
| - | - | - |
| `items` | list, find, create, update, destroy, publish, unpublish, duplicate, bulkPublish, bulkUnpublish, bulkDestroy, references, validateNew, validateExisting | itemId |
| `itemTypes` | list, find, create, update, destroy, duplicate, referencing | itemTypeId |
| `fields` | list, find, create, update, destroy, duplicate, referencing, related | itemTypeId + fieldId |
| `fieldsets` | list, find, create, update, destroy | itemTypeId + fieldsetId |
| `uploads` | list, find, create, update, destroy, references, bulkTag, bulkDestroy | uploadId |
| `roles` | list, find, create, update, destroy, duplicate | roleId |
| `webhooks` | list, find, create, update, destroy | webhookId |
| `buildTriggers` | list, find, create, update, destroy, trigger, abort, reindex | buildTriggerId |
| `plugins` | list, find, create, update, destroy, fields | pluginId |
| `accessTokens` | list, find, create, update, destroy, regenerateToken | accessTokenId |
| `environments` | list, find, fork, promote, rename, destroy | environmentId |
| `site` | find, update | (none) |
| `maintenanceMode` | find, activate, deactivate | (none) |
| `scheduledPublications` | create, destroy | itemId |
| `workflows` | list, find, create, update, destroy | workflowId |
| `uploadTracks` | list, create, destroy, generateSubtitles | uploadId + uploadTrackId |

> **Note:** `environments`? Use dedicated CLI (`environments:fork`, `environments:promote`, etc.) — better flags/output than `cma:call`.

> **Note:** Creating uploads via `cma:call` painful — raw `uploadRequest` + `uploads create` two-step JSON:API dance. Escalate to `cma:script` (stdin/file-mode): `client` exposes `client.uploads.createFromUrl()`/`client.uploads.createFromLocalFile()`. Checked-in `buildClient()` script (**datocms-cma**) only needed for unattended runtime, not upload ergonomics.

## Pagination

`list` methods return paginated results:

```bash
npx datocms cma:call items list --params '{page: {offset: 0, limit: 30}}'
npx datocms cma:call items list --params '{page: {offset: 30, limit: 30}}'
```

Default page size varies by resource. Iterating all pages? Switch to **datocms-cma** (JS client provides `listPagedIterator`).

## Output and Scripting

Default output: pretty-printed JSON. Use `--json` for piping:

```bash
npx datocms cma:call items create --json --data '{...}' | jq '.id'
npx datocms cma:call itemTypes list --json | jq '.[].api_key'
```

## When to Escalate

`cma:call` ideal for single CMA call. Task needs loops/branching/dependent calls/typed payloads? Escalate to **`cma:script`** (see `cma-script.md`) — stdin-mode for heredocs/pipes, file-mode for longer scratch scripts.

Escalate past `cma:script` when:

- **Code should be committed/versioned/replayed across environments** → **migration** (`migrations:new`), not `cma:script`. File-mode script can become migration with `mv` — imports/signature already match.
- **Code runs unattended** (CI/app server/webhook/automation) needs env CMA token → checked-in `buildClient()` script via **datocms-cma**.
- **Need tests/custom error handling/retries/progress reporting** → repo script, **datocms-cma**.

> **Tip:** Use `npx datocms cma:docs <resource> <action>` to look up exact request body shape/params before writing `cma:call` command or CMA client code.
