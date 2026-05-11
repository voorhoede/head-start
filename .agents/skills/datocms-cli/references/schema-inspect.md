# Schema Inspection

Use `datocms schema:inspect` whenever the agent or the user needs to know how a project is structured: which models and blocks exist, the fields on a given model, whether a field has validators, which field type it is, which models reference another model, how fields are organised into fieldsets, and so on. Output is TOON by default (compact, agent-friendly); `--json` falls back to JSON for `| jq` pipelines.

This is the CLI counterpart of the remote-MCP `get_schema` tool — same data shape, same filters, runnable from the terminal once the project is linked.

## Contents

- Inputs to confirm before running commands
- Command shape
- Common patterns
- Flags
- Output shape
- When to use it
- Cross-skill routing

## Inputs to confirm before running commands

Confirm these inputs when they are not already clear:

- whether the user wants **every model/block** (no argument) or a single one (pass an API key like `blog_post`, an id, or a display name — fuzzy search kicks in if there is no exact match)
- whether to restrict to `models_only` or `blocks_only` via `--type`
- which field details to include — `basic` (default, structure only) vs `complete` (everything), or selective opt-in with `--include-validators`, `--include-appearance`, `--include-default-values`
- whether to pull in related item types: `--include-fieldsets`, `--include-nested-blocks`, `--include-referenced-models`, `--include-embedding-models`
- whether the caller needs stdout as TOON (default, for agents) or JSON (`--json`, for `| jq`)
- target environment when introspecting a sandbox (`--environment`)

## Command shape

```bash
npx datocms schema:inspect [filter] [flags]
```

The `filter` positional matches by API key, id, or display name; if there is no exact match it falls back to fuzzy search over API keys and names. Omit it to dump the full schema.

## Common patterns

### Whole project overview

```bash
# Every model and block, structure only (TOON)
npx datocms schema:inspect

# Same thing, JSON for jq
npx datocms schema:inspect --json | jq '.[].itemType.api_key'
```

### A single model

```bash
# Fields and relationships for one model
npx datocms schema:inspect blog_post

# Same, plus validators and fieldset grouping
npx datocms schema:inspect blog_post \
  --include-validators --include-fieldsets

# Same, plus appearance and default values (full field payload)
npx datocms schema:inspect blog_post --fields-details=complete
```

### Blocks and the models that embed them

```bash
# Every block in the project
npx datocms schema:inspect --type=blocks_only --include-fieldsets

# A specific block plus every model that embeds it (direct or transitive)
npx datocms schema:inspect my_block \
  --type=blocks_only --include-embedding-models
```

### Following links and nested blocks

```bash
# A model plus every block nested anywhere inside it
npx datocms schema:inspect landing_page --include-nested-blocks

# A model plus every model referenced by link / links / structured_text
npx datocms schema:inspect article --include-referenced-models

# Combine both for a deep walk
npx datocms schema:inspect article \
  --include-nested-blocks --include-referenced-models
```

### Sandbox environment

```bash
npx datocms schema:inspect --environment=staging
```

## Flags

| Flag | Purpose |
| - | - |
| `--type=all\|models_only\|blocks_only` | Restrict to regular models, modular blocks, or both (default `all`) |
| `--fields-details=basic\|complete` | `basic` drops validators, appearance, and default values (default); `complete` includes everything (very verbose) |
| `--include-validators` | Include field validators |
| `--include-appearance` | Include field appearance configuration |
| `--include-default-values` | Include field default values |
| `--include-fieldsets` | Include UI fieldset organisation plus each field's `position`/`fieldset` |
| `--include-nested-blocks` | Recursively include every block nested in the selected item types |
| `--include-referenced-models` | Include models referenced by `link`, `links`, or `structured_text` fields |
| `--include-embedding-models` | For blocks only: include every model that embeds the selected blocks (direct or transitive) |
| `-e, --environment` | Target a sandbox environment instead of the primary one |
| `--json` | Switch stdout from TOON to JSON (for `\| jq` pipelines) |

Selective `--include-validators` / `--include-appearance` / `--include-default-values` flags take precedence over `--fields-details=basic`; if you pass any of them, only the selected extras are included. Use `--fields-details=complete` to get everything at once.

## Output shape

Each entry in the output array has the shape:

```json
{
  "itemType": { "id": "...", "api_key": "blog_post", "name": "Blog Post", /* ... */ },
  "fields": [
    { "id": "...", "api_key": "title", "field_type": "string", /* optional: validators, appearance, default_value, position, fieldset */ }
  ],
  "fieldsets": [ /* present only with --include-fieldsets */ ]
}
```

With `--include-nested-blocks`, `--include-referenced-models`, or `--include-embedding-models` the array grows to contain the additional item types, each de-duplicated by id.

## When to use it

Reach for `schema:inspect` whenever you need to **understand the project before acting**:

- "What models are in this project?" — no-argument call.
- "What fields does the blog_post model have?" — `schema:inspect blog_post`.
- "Does `slug` have a `required` validator?" — `schema:inspect blog_post --include-validators`.
- "What's the editor layout for this model?" — `schema:inspect blog_post --include-fieldsets --include-appearance`.
- "Which models reference the `author` model?" — `schema:inspect article --include-referenced-models` (from the referring side), or inspect `author` on its own and then check the referencing side.
- "Which models embed this block?" — `schema:inspect my_block --type=blocks_only --include-embedding-models`.
- "What blocks are allowed inside this modular field?" — `schema:inspect parent_model --include-nested-blocks`.

Prefer this command over composing equivalent `cma:call itemTypes list` / `fields list` invocations by hand — `schema:inspect` already handles fieldset grouping, nested-block walks, embedding lookups, and TOON-compact output in one shot.

## Cross-skill routing

- Follow-up task is **code that consumes the schema** (typed CMA client work, record mutations, structured-text block traversal) → switch to **datocms-cma**.
- Follow-up task is **generating TypeScript types** from the schema → `schema:generate` (see `schema-generate.md`).
- Follow-up task is **changing the schema** → see the Step 2.5 decision tree in `SKILL.md` (migration via `datocms-cli` vs direct mutation via `cma:call` / `cma:script`).
