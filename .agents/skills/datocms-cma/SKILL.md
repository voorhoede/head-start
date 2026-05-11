---
name: datocms-cma
description: >-
  Node.js/TypeScript scripts driving the DatoCMS Content Management API via
  @datocms/cma-client (-node/-browser). Code-first companion for content +
  automation work. Use for record/upload/project-automation code — short asks
  ("publish them", "fix those slugs", "delete all drafts", "bulk import this
  CSV") and checked-in scripts. Covers: (1) content ops — CRUD + publish
  records, bulk import/export, CSV pipelines, pagination, asset uploads
  (URL/file) with metadata, structured-text + block payload edits; (2) env +
  governance — fork/promote envs, webhooks, build triggers, project settings,
  maintenance mode, scheduled publish/unpublish, audit logs, usage analytics,
  subscription limits; (3) access + typed flows — roles, API tokens, upload
  tracks/tags, generated CMA types; (4) schema/UI mutation only when user opts
  out of migrations or embeds it in automation. Ordinary schema changes →
  `datocms-cli` migrations. Runs via `cma:call`/`cma:script` or checked-in
  `buildClient()` scripts.
---

# DatoCMS Content Management API Skill

Expert at writing code that interacts with DatoCMS Content Management API (CMA). Use this workflow as default. Reorder/skip steps for purely diagnostic, advisory, or explanation-only tasks.

Short imperative request in mid-conversation following earlier DatoCMS context = still DatoCMS task. Don't lose context. Signals: `@datocms/*` packages in `package.json`, `DATOCMS_*` env vars, `datocms.config.json`, `cma-types.ts`.

**CLI only — never MCP.** DatoCMS CLI for all project/schema/CMA work. Never invoke any DatoCMS MCP tool even when present in toolset — CLI's OAuth + `datocms.config.json` keeps repo as source of truth, MCP causes config drift. Load `datocms-cli` for the equivalent command. Only `npx datocms login` is user-driven (interactive browser).

## Step 1: Detect Context

If project context already established in conversation, skip broad detection. Re-inspect only when question cannot be answered from prior context.

### Step 1a — Bootstrap project awareness (CLI + `datocms link` mandatory)

CMA work on DatoCMS-connected repo requires agent-side visibility into live project (models, fields, ids, record state). `datocms` installed + `datocms login` + `datocms link` = bootstrap. Treat like `git init` / `npm install`: missing → fix first.

**Bootstrap flow** (only `datocms login` needs interactive terminal):

```bash
npm install --save-dev datocms        # if missing
npx datocms login                          # user, one-time, interactive
npx datocms projects:list [hint] --json    # agent discovers siteId
npx datocms link --site-id=<ID> [--organization-id=<ID>]   # agent links
```

**Always confirm target project with user before running `datocms link`**, even when `projects:list` returns single candidate. Show candidate(s) (name, id, organization) → wait for explicit yes. "Only one result" ≠ consent — user may have access to wrong project; fixing mis-linked project is painful.

**Detection hints** (don't rely on `which datocms` — CLI runs via `npx`):

- `datocms` in `package.json` devDependencies → CLI available
- `datocms.config.json` with `siteId` on active profile → linked
- `npx datocms whoami` succeeds → OAuth session active
- none of above → drive bootstrap above

**Token-in-`.env` = exception.** Explicit `DATOCMS_API_TOKEN` only for runtimes that cannot use OAuth: CI, server-side application code, cron, webhooks, shared repo scripts. Agent still needs CLI + link during development for project visibility.

**Learning project's shape.** Once linked, run `npx datocms schema:inspect` (optionally with model API key, id, or display name) → see real models, blocks, fields, validators, fieldsets, nested blocks, relationships — TOON output by default, `--json` for `| jq`. Use any time agent/user needs to understand project structure before writing code, choosing right field for mutation, or deciding which model to query. Prefer to composing `cma:call itemTypes list` / `fields list` by hand. Reference: `../datocms-cli/references/schema-inspect.md`.

**Red flag:** if about to say "paste a CMA token" or "add `DATOCMS_CMA_TOKEN=...` to `.env`" for task user is running interactively → stop. Right answer = bootstrap above + actual operation expressed as `cma:call` / `cma:script` invocation (shapes in Step 4).

### Step 1b — Package and project detection

Once auth approach chosen, examine project → determine runtime + which CMA client package available.

1. Read `package.json`, check for these packages (priority order):
   - `@datocms/cma-client` — Universal/isomorphic. **Recommended for most cases.** Works in any environment with native `fetch`. Only provide `fetchFn` if runtime lacks native Fetch API.
   - `@datocms/cma-client-node` — Node.js-optimized. Adds upload helpers (`createFromLocalFile`, `createFromUrl`). Use when need file-system upload convenience methods.
   - `@datocms/cma-client-browser` — Browser-optimized. Adds `createFromFileOrBlob()` for File/Blob uploads.

2. If none installed and task requires `buildClient()` code → recommend appropriate package:

   - General / universal → `@datocms/cma-client`
   - Node.js project needing upload helpers → `@datocms/cma-client-node`
   - Browser-only project needing File/Blob uploads → `@datocms/cma-client-browser`

   (For pure OAuth-path work via `cma:call` / `cma:script` — none of these need installation — CLI workspace ships its own client.)

3. Search for existing `buildClient()` calls → understand how project already configures client (API token source, environment targeting, etc.).

4. Only if deliverable = unattended runtime code (see Step 1a): check for `.env` or `.env.local` file → see whether CMA-enabled `DATOCMS_API_TOKEN` (or similar) already defined. If only variable present = something read-only (`DATOCMS_READONLY_API_TOKEN`, `NEXT_PUBLIC_DATOCMS_API_TOKEN`, CDA token) → flag that separate CMA-enabled token needed for that specific runtime — not for agent's own introspection (must go through CLI + link regardless).

5. Check for existing `cma-types.ts` file → determine if CMA type generation already set up. Do **not** proactively suggest setting up type generation. For `cma:docs` lookups, `cma:call`, `cma:script` — this skill owns execution shape directly — see cheat sheets in Step 4. For schema-change requests → see decision tree in **Step 2.5** — covers when this skill owns work directly and when routes to **datocms-cli** migrations. Otherwise route to **datocms-cli** for CLI-workflow topics (`schema:generate`, environment operations, imports, plugin management, multi-project sync, CI/CD).

**Token scope reminder** (only when unattended runtime genuinely needs one): token must have `can_access_cma: true` + role with permissions task requires (publishing, editing schema, etc.). Does not need to be "full-access" — should be scoped to smallest set of models, actions, environments that runtime actually needs.

## Step 2: Understand the Task

Classify user's task into one or more categories. Ask follow-up questions only when request is ambiguous or risk of wrong assumption is high.

- **Content operations** — Create, read, update, delete, publish, or unpublish records
- **Upload operations** — Upload files, manage assets, update metadata, bulk tag
- **Schema operations** — Create or modify models, fields, fieldsets, block models
- **Filtering & querying** — Search records, filter by fields, paginate large collections
- **Localization** — Work with localized field values and multi-locale content
- **Blocks & modular content** — Modular content fields, single-block fields, nested block payloads
- **Structured text & block tooling** — DAST payloads, embedded blocks, block traversal, debugging helpers
- **Environment operations** — Fork, promote, rename, delete sandbox environments
- **Webhook & deploy operations** — Configure webhooks, build triggers, deploy management
- **Access control** — Create roles, manage API tokens, invite users
- **Scheduling** — Schedule publish/unpublish, manage workflows
- **Migration & scripting** — Bulk data operations, content seeding, field migrations
- **Type generation** — Consume generated CMA schema types or wire typed record operations
- **Dashboard & schema menu management** — Organize navigation sidebar items, group models in menus
- **Plugin management** — Install, configure, or audit plugins programmatically
- **Project settings & usage** — Site settings, maintenance mode, subscription limits, usage tracking, white-label
- **Saved filters** — Create or manage saved record/upload filter views
- **Audit & debugging** — Query audit logs, inspect async job results, CMA-side search

If user's request clear and falls into obvious category → skip clarifying questions, proceed directly.

## Step 2.5: Schema changes — decide approach with user

DatoCMS schema operations fall into four buckets. Choice of approach ≠ automatic — ask user when bucket not obvious from request (reversibility + workflow preference matter more than which tool performs mutation).

| Situation | What it covers | Approach |
| - | - | - |
| **Destructive schema change** | DROP a field, DROP a model, `bulk_destroy` records, lossy `field_type` changes (e.g. `string → json`, `json → string`, anything that discards stored values) | **Migration** via `datocms-cli` (`migrations:new`), against forked sandbox first. Never run these against primary environment without explicit, repeated user confirmation. |
| **Reversible schema change** | Add a field, add a model or block, rename a field, toggle `required`, add or tighten a validation, reorder fieldsets | **Ask the user.** Both approaches safe; pick by preference + context. Lean to migration (`datocms-cli`) when repo already uses migrations workflow or user is on secondary branch — reviewable, reproducible. Direct mutation (`cma:call` for single call, `cma:script` stdin-mode for multi-step) fine for quick iteration on sandbox. Default to migration only when user has no preference AND repo shows migration conventions (`migrations/` directory, prior migration commits). |
| **User-requested one-off** | Phrases like "quickly, without a migrations workflow", "just patch this", "one-off", "don't scaffold migrations for this" | **Honor the opt-out.** Use direct mutation via `cma:call` (single call with shape from `cma:docs`) or `cma:script` stdin-mode (loops, multi-step, dependent calls). Do not re-suggest migrations unless change turns out to be destructive schema change. |
| **Content operation** | Publish, unpublish, delete individual records, fix slugs, bulk update a field value, re-tag uploads | No migration needed. Prefer `cma:call` for single call; `cma:script` stdin-mode for loops, pagination, or multi-step logic. Code that needs to be committed and replayed across environments = migration (`datocms-cli`), not this skill. |

Regardless of which skill loaded — **question to ask user is same** for reversible schema change: _"Do you want this as a reviewable migration, or a direct mutation against a sandbox?"_ Answer determines which skill owns follow-up — not which skill was loaded first.

**Cross-skill routing.**

- User-requested one-offs, content operations, and direct-mutation branch of reversible schema change = this skill's core: `cma:call`, `cma:script` stdin-mode (file-mode only as debug fallback — see Step 4). Stay here + load references in Step 3.
- Destructive schema changes, migration branch of reversible schema change, and anything that must be committed/versioned/replayed across environments better covered by **datocms-cli** (`migrations:new`, `migrations:run`). Switch when change is destructive, when repo already uses migrations workflow, or when user wants change as reviewable migration. Handoff = loading sibling skill's references — do not bounce the user.
- Unattended runtime code (CI, app server, webhook, long-lived automation) = separate scenario — where checked-in `buildClient()` script belongs. See Step 4 ("Client Setup").

## Step 3: Load References

Two documentation sources available — pick right one for question:

1. **`npx datocms cma:docs <resource> <action>`** = live, always-up-to-date source for endpoint shapes, payload attributes, validators, client TypeScript signatures. Always reflects installed client version — never stale. **Use as default for every "what does this endpoint accept / return" question.** For all flags load **datocms-cli** skill + read `../datocms-cli/references/direct-cma-calls.md` § cma:docs first time this skill needs to consult endpoint documentation. That file = single source of truth for command; do not re-derive flags from this skill.

2. **Reference files in this directory** carry opinionated mental models, decision trees, cross-cutting workflows, pattern ordering invariants — things `cma:docs` doesn't know. **Use for "how should I approach this" questions.**

> **`cma:docs` = CLI command — its full surface (flags, naming convention, when to pass `--expand-types`) lives in sibling skill.**

**Always load:**

- `references/client-setup-and-errors.md` — Package choice, client setup, token/environment config, error handling

**Routing per task category — same two-step routine for every row:**

1. Run `npx datocms cma:docs` → fetch live endpoint shape, payload attributes, TS signatures.
2. **Then load reference listed below** for workflow, mental model, ordering invariants, gotchas `cma:docs` doesn't carry.

Each reference opens with reminder of specific `cma:docs <resource>` to consult — never re-derive endpoint shapes from prose, always pull them live.

| Task category | Reference |
| - | - |
| Content operations | `references/records.md` |
| Upload operations | `references/uploads.md` |
| Schema operations | `references/schema.md` |
| Filtering & querying | `references/filtering-and-pagination.md` |
| Localization | `references/localization.md` |
| Blocks & modular content | `references/editing-records.md` |
| Structured text & block tooling | `references/editing-records.md` |
| Environment operations | `references/environments.md` |
| Access control | `references/access-control.md` |
| Migration & scripting | `references/migration-patterns.md` |
| Type generation | `references/type-generation.md` |
| Project settings & usage | `references/project-settings-and-usage.md` |
| Webhook & deploy operations | `references/resource-gotchas.md` § Webhooks / Build triggers |
| Scheduling | `references/resource-gotchas.md` § Scheduling / Workflows |
| Dashboard & schema menu management | `references/resource-gotchas.md` § Dashboard and schema menus |
| Plugin management | `references/resource-gotchas.md` § Plugins |
| Saved filters | `references/resource-gotchas.md` § Saved filters |
| Audit & debugging | `references/resource-gotchas.md` § Async job results / CMA search results / Audit log events |

**Load cross-cutting references when needed:**

If task:

- involves localized fields in any context → also load `references/localization.md`
- uses `raw*()` methods, generated CMA types, advanced client behavior, or platform limits → also load `references/client-types-and-behaviors.md`
- involves modular content, single-block fields, DAST structured text, block traversal, or any per-locale backfill → also load `references/editing-records.md`
- involves listing many records → also load `references/filtering-and-pagination.md`
- \= migration script → also load `references/migration-patterns.md` plus whatever domain refs needed
- involves video upload subtitles/tracks or upload tag management → also load `references/resource-gotchas.md` § Upload tracks and tags
- involves maintenance mode before a migration → also load `references/project-settings-and-usage.md`
- involves checking subscription limits before bulk operations → also load `references/project-settings-and-usage.md`

## Step 4: Generate the Solution

When response includes code — follow these default rules:

### Authentication (respect Step 1a bootstrap)

- CLI + link = prerequisite of Step 4, not choice. If project not yet linked → fix first (propose install + login + link) before writing any solution code.
- For interactive / one-off work (majority of CMA tasks) — do not write `buildClient({ apiToken: ... })` code at all — output `cma:call` invocation (single call with shape from `cma:docs`) or `cma:script` stdin-mode (loops/multi-step) using shapes below. CLI handles auth silently via linked project; no cross-skill hop needed.
- Only when deliverable = unattended runtime code (CI, server-side app, long-lived automation, repo-committed shared scripts) should response include `buildClient()` + env-var token code.

#### `cma:call` shape — do not invent REST-style flags

`cma:call` is **positional** (`<resourceCamelCase> <methodCamelCase>` + any URL placeholders as extra positional args), with JSON5 request bodies + query params passed via `--data` / `--params`. **Not** REST wrapper — no `--endpoint`, `--method`, `--query-params`, or `--body` flag. Use **camelCase** for resource/method names (matches JS client: `client.itemTypes.create`).

```bash
npx datocms cma:call items list --params='{filter: {type: "article"}}'
npx datocms cma:call items find <ITEM_ID>
npx datocms cma:call items update <ITEM_ID> --data='{title: "Updated"}'
npx datocms cma:call items publish <ITEM_ID>

# Schema (prefer a migration unless the user opted out)
npx datocms cma:call fields create <ITEM_TYPE_ID> --data='{label: "Title", api_key: "title", field_type: "string"}'
```

`--data` / `--params` accept JSON5 (unquoted keys, single-quoted wrapping) — keeps shell escaping sane. If unsure about exact resource/method/body shape → run `npx datocms cma:docs <resource> <action>` — that = authoritative source.

#### `cma:script` shape — stdin-mode is the main road; file-mode is debug-only

Three main roads, picked by _deliverable shape_: stable/replayable → migration (`datocms-cli`); one-off interactive (loops, branching, dependent calls, typed `Schema.*`) → `cma:script` **stdin-mode**; code that runs inside the app/server/cron/webhook → checked-in `buildClient()` script (Step 4). **file-mode `cma:script` is none of these** — last-resort debug fallback only, when stdin-mode misbehaves and you need editor LSP, breakpoints, intermediate-state dumps, or a non-prebundled module to bisect. Long heredoc / "rerun by name" are not reasons — those belong in a migration or `buildClient()` script.

**stdin-mode** — top-level await, piped or heredoc. Zero setup. `client` (pre-authenticated), `Schema.*` (project record types), and every named export of `@datocms/cma-client-node`, `datocms-structured-text-utils`, `datocms-structured-text-dastdown` are **ambient globals** inside CLI-bundled workspace — no `import` needed (e.g. `buildBlockRecord`, `mapNodes`, `parse`, `serialize`, `SchemaRepository`, `ApiTypes`). `tsc --noEmit` type-checks before execution; `any` + `unknown` rejected. `export default` not supported here — drop to file-mode only when _debugging_ requires a function shape. Anything outside those 3 modules (e.g. `datocms-html-to-structured-text`, `datocms-structured-text-to-{plain-text,html-string,markdown}`, `parse5`) is unavailable in stdin-mode — debug fallback to file-mode and install it.

```bash
npx datocms cma:script <<'EOF'
const items = await client.items.list<Schema.Article>({ filter: { type: 'article' } });
console.log(items.length);
EOF
```

**file-mode (debug fallback only)** — `export default async function(client: Client)` in `.ts` file on disk. Runs in user's own TypeScript context (editor LSP against `tsconfig.json`, or explicit `tsc --noEmit`; no CLI-side typecheck). See cap above for when to reach for it; not "code to commit".

```ts
// tmp/scripts/publish-drafts.ts
import type { Client } from 'datocms/lib/cma-client-node';
// Optional typed project schema — run once next to the script:
//   npx datocms schema:generate ./datocms-schema.ts
// import * as Schema from './datocms-schema';

export default async function (client: Client): Promise<void> {
  for await (const draft of client.items.listPagedIterator<Schema.AnyModel>({
    filter: { fields: { _status: { eq: 'draft' } } },
  })) {
    await client.items.publish(draft.id);
  }
}
```

```bash
npx datocms cma:script tmp/scripts/publish-drafts.ts [--environment <env>]
```

Rules of thumb:

- **`cma:call` first** for single call with shape from `cma:docs`. `cma:script` only when task needs loops, pagination, branching, dependent calls, or typed `Schema.*`.
- **file-mode placement**: gitignored scratch dir (`tmp/scripts/`, `scratch/`, `~/scratch/dato/`). Never under `migrations/` — owned by `migrations:run`. Requires `datocms` reachable in `node_modules` from file's directory.
- **Typed `Schema.*` in file-mode** opt-in: `npx datocms schema:generate ./datocms-schema.ts` + `import * as Schema from './datocms-schema'`. Ambient in stdin-mode.
- **Promotion to migration**: file-mode imports `Client` from `datocms/lib/cma-client-node` — same import migrations use, so a debugged file-mode script can be `mv`'d into `migrations/`.
- **Redirect `2>/dev/null`** when piping stdin-mode stdout into `jq`.
- **Pre-installed packages = stdin-only**; file-mode installs into own `package.json`.

For advanced patterns (workspace flags, stdout shaping, long-running scripts) → consult **datocms-cli** skill.

### Client Setup (unattended-runtime code only)

- Default to `buildClient()` from detected package (Step 1b)
- Read API token from environment variable; never hardcode, never ask user to paste into chat
- Set `environment` option when working with sandbox environments

### API Surface

- Default to simplified API (e.g., `client.items.create()`) because it handles serialization/deserialization automatically
- Switch to `raw*()` methods only when task explicitly needs raw JSON:API payloads, relationship metadata, or generated CMA schema types are intentionally part of solution

### Pagination

- Prefer `*.listPagedIterator()` (for example `client.items.listPagedIterator()`) when iterating over collections
- Avoid manual offset/limit pagination loops unless resource genuinely lacks iterator
- Use `for await...of` to consume async iterators

### Blocks

- Prefer `buildBlockRecord()` when creating block records for simplified API
- Import from same package as `buildClient`

### Error Handling

- Catch `ApiError` for API failures — provides `.errors` getter + `.findError()` method
- Catch `TimeoutError` for request timeouts in long-running or request-heavy flows
- Import both from same package as `buildClient`

### TypeScript

- **Never `any` / `unknown`** — ambient-globals runtimes (`cma:script` stdin-mode, MCP `upsert_and_execute_{safe,unsafe}_script`) reject pre-execution. Use typed primitives: `Schema.X` generics on every `client.items.*` call, `FieldValueInRequest<typeof rec, "field">` for collections built locally, type-guard imports (`isSpan`, `isHeading`, `isBlockWithItemOfType`, …) inside callbacks. Escape hatch: derive precise type via `ApiTypes.*`, never annotate `any`.
- Follow TypeScript strictness rules: no `as unknown as`, no unnecessary `as` casts
- Let TypeScript infer types wherever possible
- Use `import type { ... }` for type-only imports

## Step 5: Verify

Before presenting final code:

1. **Project-awareness bootstrap** — Confirm repo has `datocms` npm package installed + project linked (`datocms.config.json` with `siteId`, `npx datocms whoami` succeeds). If not — final proposal must include install + login + link sequence before any CMA operation. For interactive / one-off tasks — deliverable should be `cma:call` / `cma:script` invocation (shapes in Step 4), not `buildClient()` script that requires token in `.env`. Only when code will run unattended (CI, server-side app, long-lived automation) should token-in-env solution be presented — + in that case token must have CMA access enabled + role permissions task needs. Schema changes require role with `can_edit_schema: true`.
2. **Environment targeting** — If working with sandbox → ensure `environment` config option set
3. **Error handling** — Ensure `ApiError` caught at appropriate boundaries
4. **Pagination** — If solution iterates collection that could exceed single page → prefer `listPagedIterator()`
5. **Type safety** — Ensure no type assertions (`as`) used to silence errors
6. **Imports** — Ensure all imports come from correct package (one detected in Step 1)
7. **Generated types** — If solution intentionally uses generated CMA types (`cma-types.ts`) → ensure chosen path typed end to end: simplified API generics by default, or `raw*()` / `RawApiTypes.Item<>` only when raw payload access intentional

If generated code = script (migration, seeding, etc.) → wrap in async function with proper error handling + progress reporting.

## Cross-Skill Routing

This skill covers **content management via REST CMA** (mutations, schema, uploads, webhooks, scripts). If task involves any of following → activate companion skill:

| Condition | Route to |
| - | - |
| CLI-workflow topics: migrations (creating, running, autogenerate), `schema:generate`, environment operations (`fork`/`promote`/`destroy`/`rename`), imports (WordPress, Contentful), CLI plugin management, blueprint/multi-project sync, CI/CD deployment workflows | **datocms-cli** |
| Querying content with GraphQL for frontend display | **datocms-cda** |
| Setting up draft mode, Web Previews, Content Link, real-time subscriptions, or framework integration | **datocms-frontend-integrations** |
| Building a DatoCMS plugin | **datocms-plugin-builder** |
