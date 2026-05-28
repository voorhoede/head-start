---
name: datocms-cli
description: >-
  DatoCMS CLI (datocms) — command-line migrations, schema codegen, schema
  inspection, one-off CMA calls, typed TypeScript CMA scripts, env operations,
  deployment workflows, multi-project profile syncing. Use for datocms CLI
  commands/scripts: migrations:new, migrations:run; schema:generate;
  schema:inspect (dump models, blocks, fields, validators, appearance,
  fieldsets, nested blocks, referenced/embedding models); cma:call, cma:docs,
  cma:script (ad-hoc typed TS with ambient client/Schema globals); migration
  scaffolding for models/fields/blocks; CLI setup via datocms.config.json +
  profiles; OAuth (login/logout/whoami); projects:list; project link/unlink;
  env list/fork/promote/rename/destroy; maintenance-mode toggle; CI/CD
  migration pipelines; blueprint/client project sync; imports from WordPress
  or Contentful (assets + content); CLI plugin management
  (plugins:install/add/available/link/remove/update/reset/inspect).
---

# DatoCMS CLI Skill

You're an expert at `datocms` CLI. Follow these steps. Don't skip.

## Step 1: Detect Context

If context already set (CLI package, config, token, migrations dir, TS setup), skip detection. Re-inspect only when can't answer from prior context.

**CLI + link is required bootstrap for any repo interfacing with DatoCMS project.** `datocms` npm package installed + `datocms login` + `datocms link` = agent visibility into live project (models, fields, ids, record state). Missing → fix first, same as `git init` or `npm install`.

### Detection (don't rely on `which datocms` — CLI runs via `npx`)

1. `datocms` in `package.json` devDependencies → CLI available. Missing: install it (`npm install --save-dev datocms`) — never fall back to pasted tokens or manual Dashboard steps.
2. `datocms.config.json` with `siteId` on active profile → linked. Missing: drive bootstrap below.
3. `npx datocms whoami` succeeds → OAuth session active.
4. `migrations/` directory → migrations already scaffolded.
5. `tsconfig.json` or `migrations.tsconfig` → TS migrations convention.

### Bootstrap flow (CLI available but not linked)

Only `datocms login` needs terminal; rest runs in non-TTY.

```bash
npx datocms login  # user, one-time, interactive
npx datocms projects:list [hint] --json # agent discovers siteId
npx datocms link --site-id=<ID> [--organization-id=<ID>] # agent links
```

**Always confirm target project with user before running `datocms link`**, even when `projects:list` returns single candidate. Show candidate(s) (name, id, organization) and wait for explicit yes. Don't treat "only one result" as consent — user may have access to project they didn't mean to wire to this repo; fixing mis-linked project later is painful.

`datocms link` without `--site-id` requires terminal. In non-TTY it now exits cleanly with suggestion to pass `--site-id`; don't retry without it. Same when credentials missing — ask user to run `datocms login` first.

Once project linked, use `npx datocms schema:inspect` (optionally with model API key, id, or display name) to learn what project actually contains — models, blocks, fields, validators, fieldsets, nested blocks, relationships. This is right tool any time agent or user needs generic info about project structure; reach for it before writing mutations, migrations, or CMA code so decisions rest on real schema rather than guesses. See `references/schema-inspect.md`.

### Authentication policy

- **Interactive task**: OAuth via `login` + `link` is mechanism. Never ask user to paste token or add `DATOCMS_CMA_TOKEN=...` to `.env` for this case.
- **Unattended execution** (CI, cron, server-side app, shared scripts without OAuth session): CMA-enabled token via env var. Read-only CDA tokens (`DATOCMS_READONLY_API_TOKEN`, `NEXT_PUBLIC_DATOCMS_API_TOKEN`) won't work — flag that separate CMA-enabled token is needed. Agent itself still needs CLI + link at development time for visibility.

**Token resolution order CLI uses:**

- `--api-token` flag
- Linked project (OAuth-backed, default after `login` + `link`)
- Env var: `DATOCMS_API_TOKEN` (default profile), `DATOCMS_<PROFILE>_PROFILE_API_TOKEN` (named), or custom `apiTokenEnvName`
- Profile override via `DATOCMS_PROFILE`

## Step 2: Understand the Task

Classify user's task into one or more categories:

| Category | Examples |
| - | - |
| **CLI setup** | Install CLI, authenticate (`login`/`logout`/`whoami`), discover accessible projects (`projects:list`), link/unlink projects (`link`/`unlink`), configure profiles, `datocms.config.json` |
| **Schema changes** | Add, modify, or remove models, fields, fieldsets, or block models — via migration script (default) or direct CMA operation against chosen environment |
| **Creating migrations** | Scaffold new migration scripts, autogenerate from environment diffs, custom templates (sub-task of schema changes once migration approach chosen) |
| **Running migrations** | Execute pending migrations, dry-run, fork-and-run, in-place execution |
| **Schema generation** | Run `schema:generate`, scope output to item types, target specific environment |
| **Schema inspection** | Run `schema:inspect` to dump models, blocks, fields, validators, appearance, default values, fieldsets, nested blocks, referenced models, or embedding models — use any time agent or user needs to understand how project is structured before writing code or mutations |
| **Direct CMA calls** | Use `cma:docs` to browse API reference, `cma:call` for single call with shape from docs, `cma:script` for one-off TS logic that needs loops, branching, or typed `Schema.*` types — stdin-mode for heredocs/pipes, file-mode for longer scripts in gitignored scratch dir |
| **Environment management** | Fork, promote, rename, destroy, list environments via CLI commands |
| **Deployment workflow** | Maintenance mode, safe deployment sequences, CI/CD integration |
| **Multi-project sync** | Shared migrations across blueprint/client projects via CLI profiles |
| **Importing content** | WordPress import, Contentful import |
| **CLI plugin management** | Install, remove, update, list, inspect, link, or reset CLI plugins (`plugins:*` commands) |

## Step 2.5: Collect Critical Inputs Before You Commit To Commands

Do **not** skip questions merely because category is obvious. Skip follow-up questions **only if** request already includes critical inputs for relevant category, or repo inspection answers them safely.

Ask **minimum targeted question set** needed to avoid flattening real workflow decision.

### Category-specific inputs live in reference files

Each category reference loaded in Step 3 opens with **"Inputs to confirm before running commands"** section — that is per-category equivalent of this step. Don't skip loading reference for task's category: it carries workflow decisions this step is designed to protect. If you skip it, you skip checklist.

### Schema changes — decide approach with user

DatoCMS schema operations fall into four buckets. Choice of approach is not automatic — ask user when bucket is not obvious from request, because reversibility and workflow preference matter more than which tool performs mutation.

| Situation | What it covers | Approach |
| - | - | - |
| **Destructive schema change** | DROP field, DROP model, `bulk_destroy` records, lossy `field_type` changes (e.g. `string → json`, `json → string`, anything that discards stored values) | **Migration** via `datocms-cli` (`migrations:new`), against forked sandbox first. Never run these against primary environment without explicit, repeated user confirmation. |
| **Reversible schema change** | Add field, add model or block, rename field, toggle `required`, add or tighten validation, reorder fieldsets | **Ask user.** Both approaches safe; pick by preference and context. Lean to migration (`datocms-cli`) when repo already uses migrations workflow or user is on secondary branch — reviewable, reproducible. Direct mutation (`cma:call`, `cma:script` stdin-mode, or `cma:script` file-mode) fine for quick iteration on sandbox. Default to migration only when user has no preference AND repo shows migration conventions (`migrations/` directory, prior migration commits). |
| **User-requested one-off** | Phrases like "quickly, without migrations workflow", "just patch this", "one-off", "don't scaffold migrations for this" | **Honor opt-out.** Use direct mutation via `cma:call` (single call with shape from `cma:docs`) or `cma:script` (stdin-mode for loops/multi-step, file-mode when script is long enough that heredoc hurts). Don't re-suggest migrations unless change turns out to be destructive schema change. |
| **Content operation** | Publish, unpublish, delete individual records, fix slugs, bulk update field value, re-tag uploads | No migration needed. Prefer `cma:call` for single call; `cma:script` stdin-mode for loops, pagination, or multi-step logic; `cma:script` file-mode only when heredoc becomes painful. Code that needs to be committed and replayed across environments is migration (`datocms-cli`), not **datocms-cma**. |

Regardless of which skill is loaded, **question to ask user is same** for reversible schema change: _"Do you want this as reviewable migration, or direct mutation against sandbox?"_ Answer determines which skill owns follow-up — not which skill was loaded first.

**Cross-skill routing:**

- Destructive schema changes and migration branch of reversible schema change are this skill's core: `migrations:new`, `migrations:run`, fork-and-run, safe deployment. Stay here and load `creating-migrations.md` + `running-migrations.md`.
- User-requested one-offs, content operations, and direct-mutation branch of reversible schema change are better covered by **datocms-cma**. Switch when user has opted out of migrations, when task is content mutation (publish, delete, fix), or when user wants `cma:script` or checked-in `buildClient()` script. Handoff is loading sibling skill's references — don't bounce user.
- Unattended runtime code (CI, app server, webhook, long-lived automation) is separate scenario — that is where checked-in `buildClient()` script belongs, and **datocms-cma** owns that pattern.

### Destructive and production-sensitive confirmations

Destructive schema changes always require these confirmations; list below also covers non-schema destructive commands.

If context missing, ask for explicit confirmation before proposing final commands for:

- `environments:destroy`
- `environments:promote`
- imports into non-obviously disposable target
- `migrations:run --in-place` on primary-like environment
- `maintenance:on --force`
- `environments:fork --fast --force`
- `cma:call` with `destroy`, `bulk_destroy`, or `promote` methods
- direct schema mutations (via `cma:call` or `cma:script`) targeting primary-like environment instead of migration on forked sandbox
- `plugins:reset` (removes all user-installed and linked CLI plugins)

## Step 3: Load References

Based on task classification, read appropriate reference files from `references/` directory next to this skill file. Only load what's relevant.

**Always load:**

- `references/cli-setup.md` — Installation, configuration, profiles, global flags, token resolution

**Load per category:**

| Task category | Reference file |
| - | - |
| Creating migrations | `references/creating-migrations.md` |
| Running migrations | `references/running-migrations.md` |
| Schema generation | `references/schema-generate.md` |
| Schema inspection | `references/schema-inspect.md` |
| Direct CMA calls | `references/direct-cma-calls.md` (for `cma:call`) and/or `references/cma-script.md` (for `cma:script`) |
| Environment management | `references/environment-commands.md` |
| Deployment workflow | `references/deployment-workflow.md` |
| Multi-project sync | `references/blueprint-sync.md` |
| Importing content | `references/importing-content.md` |
| CLI plugin management | `references/cli-plugin-management.md` |

**Load cross-cutting references when needed:**

- If creating + running migrations together -> load both `creating-migrations.md` and `running-migrations.md`
- If schema generation followed by typed CMA code changes -> also load `datocms-cma` guidance for consuming generated types
- If direct CMA call grows beyond one-off command -> switch to `datocms-cma` for reusable code
- If deployment involves environment commands -> also load `environment-commands.md`
- If multi-project sync involves rollout execution -> also load `running-migrations.md`
- If CLI plugin install is specifically for WordPress/Contentful import -> also load `importing-content.md`

## Step 4: Generate Code

Write commands and scripts following mandatory rules:

### Command Prefix

- Respect repo's existing package-manager execution style when one already established (`npm run ...`, `pnpm exec ...`, `bunx ...`)
- Otherwise default to `npx datocms` so local CLI version used
- Example: `npx datocms migrations:new "add blog model" --ts`

### Migration File Templates

- When generating migration file content, use **exact function signatures** from reference files
- TypeScript: `export default async function(client: Client): Promise<void>`
- JavaScript: `module.exports = async (client) => {}`
- Import for TypeScript migrations: `import { Client } from 'datocms/lib/cma-client-node'`

### File Naming

- Migration files automatically named: `{unix_timestamp}_{camelCaseName}.ts|.js`
- Don't manually create migration files — always use `npx datocms migrations:new`

### Migration Script Bodies

- For CMA API calls inside migration scripts (creating models, fields, records, uploads), defer to **datocms-cma** reference patterns
- `client` parameter in migrations is same CMA client from `@datocms/cma-client-node`

### Schema Generation

- Use `npx datocms schema:generate <filename>` to generate TS schema definitions
- Use `--item-types` to narrow output when user only needs specific models
- Use `--environment` when generated types must reflect sandbox or staging environment
- Route follow-up code changes that consume those types to `datocms-cma`

### Schema Inspection

- Use `npx datocms schema:inspect` any time agent or user needs project structure information — models, blocks, field definitions, validators, appearance, default values, fieldset grouping, nested blocks, referenced or embedding models
- No argument dumps every model and block; pass API key, id, or display name to narrow down (fuzzy fallback when there is no exact match)
- Defaults to TOON output for agent consumption; add `--json` when piping through `jq`
- Opt into extra detail selectively with `--include-validators`, `--include-appearance`, `--include-default-values`, `--include-fieldsets`, `--include-nested-blocks`, `--include-referenced-models`, `--include-embedding-models`; use `--fields-details=complete` to include everything at once
- Restrict to regular models or modular blocks with `--type=models_only` / `--type=blocks_only`; target sandbox schemas with `--environment`
- Prefer `schema:inspect` over composing `cma:call itemTypes list` + `fields list` by hand — it already resolves fieldsets, nested blocks, and embedding models in one call

### Direct CMA Calls

- Use `npx datocms cma:docs <resource> <action>` to look up endpoint details (request body, parameters, examples) before constructing command
- Use `npx datocms cma:call <resourceCamelCase> <methodCamelCase> [...pathArgs]` for single-method ad-hoc CMA operations
- Pass request bodies with `--data '{...}'` and query parameters with `--params '{...}'`
- Add `--environment` when call must target sandbox environment
- `cma:call` is **positional** (`<resourceCamelCase> <methodCamelCase>` + URL placeholders as extra positional args). It is **not** REST wrapper: there is no `--endpoint`, `--method`, `--query-params`, or `--body` flag — don't invent these
- Prefer **camelCase** for resource/method names in examples (matches JS client: `client.itemTypes.create`); snake_case is also accepted but be consistent

Concrete shape, with JSON5 accepted in `--data` / `--params`:

```bash
npx datocms cma:call items list --params='{filter: {type: "article"}}'
npx datocms cma:call items find <ITEM_ID>
npx datocms cma:call items update <ITEM_ID> --data='{title: "Updated"}'
npx datocms cma:call items publish <ITEM_ID>
npx datocms cma:call fields create <ITEM_TYPE_ID> --data='{label: "Title", api_key: "title", field_type: "string"}'
```

Run `npx datocms cma:call --help` for full list of built-in examples, or `npx datocms cma:docs <resource> <action>` for body schema and required fields.

- Use `npx datocms cma:script` when task needs loops, branching, multiple dependent calls, or typed `Schema.*` records, but code does not need to live in repo
- **stdin-mode** (heredoc / pipe / redirect): top-level await only, ambient `client` and `Schema`, `tsc --noEmit` type-checks before execution, pre-installed packages available. Zero setup
- **file-mode** (`.ts` file on disk):
  - Signature: `export default async function (client: Client)` with `Client` imported from `datocms/lib/cma-client-node` — same import as migrations, so file-mode script can be promoted with plain `mv` into `migrations/`.
  - Validation: no CLI-side typecheck; rely on your editor LSP against your `tsconfig.json`, or explicit `tsc --noEmit`. Typed `Schema.*` is opt-in via `datocms schema:generate ./datocms-schema.ts`.
  - Placement: gitignored scratch dir (`tmp/scripts/`, `scratch/`). Prefer migration for anything you want to commit, version, and replay across environments.
- Redirect `2>/dev/null` when piping stdin-mode stdout into `jq`
- Switch to **datocms-cma** when task needs reusable code checked into repo for **unattended runtime** (CI, app server, webhook, long-lived automation)
- **Schema changes:** default to scaffolding migration. Only propose `cma:call` or `cma:script` for schema mutations after user has explicitly opted out of migration workflow, and never propose direct schema mutation against primary-like environment without explicit confirmation from user

### CLI Plugin Commands

- Use `npx datocms plugins:available` to discover official CLI plugins before installing
- Use `npx datocms plugins:add <PLUGIN>` to install CLI plugin by npm package name or GitHub URL
- Use `npx datocms plugins:link <PATH>` only for local plugin development
- These commands manage CLI extensions, not DatoCMS project plugins — route project plugin work to **datocms-plugin-builder**

### Environment Safety

- Always specify `--source` when running migrations to be explicit about target
- Use `--dry-run` first to preview changes before applying
- Prefer fork-and-run (default) over `--in-place` for production environments
- Treat `--force` as explicit override, not default

## Step 5: Verify

Before presenting final commands or scripts:

1. **API token** — Confirm CMA-enabled token available (via env var or `--api-token` flag)
2. **Config file** — If using profiles, verify `datocms.config.json` exists and has right profile
3. **Migrations directory** — Confirm migrations directory exists or will be created by command
4. **TypeScript config** — If generating TS migrations, ensure `tsconfig.json` exists or `--migrations-tsconfig` is set
5. **Schema generation scope** — If using `schema:generate`, verify output file path plus any `--item-types` / `--environment` scope match request
6. **Direct CMA calls** — If using `cma:call`, verify positional args, `--data`, `--params`, and `--environment` align with targeted method. If using `cma:script`, verify script uses `Schema.*` types (not `any`/`unknown`), imports only from pre-installed package list, and targets intended environment
7. **Environment targeting** — Verify correct `--source` / `--destination` environment specified
8. **Safety checks** — For destructive operations (promote, destroy, destructive `cma:call` usage, risky imports, maintenance-mode force), confirm user intends to target right environment. For schema mutations, confirm chosen approach (migration vs direct) and — if direct — target environment (sandbox vs primary) before issuing commands
9. **CLI plugin commands** — If using `plugins:*` commands, verify plugin name is correct and distinguish CLI plugins from DatoCMS project plugins

## Cross-Skill Routing

This skill covers **CLI commands, flags, configuration, workflows, and migration file scaffolding**. If task involves any of following, activate companion skill:

| Condition | Route to |
| - | - |
| CMA API calls inside migration script bodies (records, schema, uploads) | **datocms-cma** |
| Programmatic environment management via `client.environments.*` in code | **datocms-cma** |
| Consuming generated schema types inside application code or reusable scripts | **datocms-cma** |
| Querying content with GraphQL for frontend display | **datocms-cda** |
| Setting up framework integration, draft mode, or real-time updates | **datocms-frontend-integrations** |
| Building a DatoCMS plugin | **datocms-plugin-builder** |
