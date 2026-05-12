# Environment Commands

Managing DatoCMS environments (sandboxes) and making direct CMA calls from the CLI.

## Inputs to confirm before running commands

Confirm these inputs when they are not already clear:

- exact environment ids involved
- whether the target is disposable
- whether the action is read-only, destructive, or promotion-related

## Simple Environment Commands

- **`environments:list`** (alias: `environments:index`) — list all primary and sandbox environments: `npx datocms environments:list`
- **`environments:primary`** — get the ID of the primary environment: `npx datocms environments:primary` (CLI convenience — no direct CMA client equivalent)
- **`environments:rename`** — rename an environment: `npx datocms environments:rename <ENVIRONMENT_ID> <NEW_ENVIRONMENT_ID>`
- **`environments:destroy`** — destroy a sandbox environment: `npx datocms environments:destroy <ENVIRONMENT_ID>`

**Warning:** `environments:destroy` permanently deletes the environment and all its data.

## environments:fork

Create a new sandbox environment by forking an existing one:

```bash
npx datocms environments:fork <SOURCE_ENVIRONMENT_ID> <NEW_ENVIRONMENT_ID>
```

Run `npx datocms environments:fork --help` for all flags (including `--fast` and `--force`).

### Examples

```bash
# Fork primary into a sandbox named "staging"
npx datocms environments:fork main staging

# Fast fork for large environments
npx datocms environments:fork main staging --fast

# Force fast fork even if editors are active
npx datocms environments:fork main staging --fast --force
```

## environments:promote

Promote a sandbox environment to primary:

```bash
npx datocms environments:promote <ENVIRONMENT_ID>
```

### Example

```bash
npx datocms environments:promote staging
```

**Warning:** This replaces the current primary environment. The old primary becomes a sandbox.

## cma:call (Environment-Specific Usage)

For one-off environment operations from the terminal, `cma:call` can target environments directly:

```bash
# List all environments
npx datocms cma:call environments list

# Find an environment
npx datocms cma:call environments find <ENVIRONMENT_ID>

# Target a specific environment for any resource
npx datocms cma:call items list --environment=staging
npx datocms cma:call itemTypes list --environment=my-feature
```

> **Prefer the dedicated CLI commands** (`environments:fork`, `environments:promote`, etc.) over `cma:call environments` — they have better flags and output.

For full `cma:call` documentation — all resources, methods, flags, pagination, JSON5 syntax, and scripting patterns — see `references/direct-cma-calls.md`.
