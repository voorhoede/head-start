# Creating Migrations

Scaffolding new migration scripts with `migrations:new`.

## Inputs to confirm before running commands

Only enter this sub-task once the user has chosen the migration approach (see "Schema changes" in Step 2.5 of SKILL.md). Confirm these inputs when they are not already clear:

- manual migration vs `--autogenerate`
- sandbox/source environment if `--autogenerate` is requested
- TypeScript vs JavaScript output when the repo does not already imply it
- whether schema helper types (`--schema`) are needed

**Always warn** that `--autogenerate` captures schema changes only. It does **not** include records or uploads.

## Command

```bash
npx datocms migrations:new <NAME> [flags]
```

Creates a new migration script in the migrations directory.

Run `npx datocms migrations:new --help` for all available flags.

> **Precondition:** any mode that inspects the live DatoCMS project (especially `--autogenerate`) needs a CMA-enabled token via a linked project (`datocms link`), `--api-token` flag, or environment variable.

## Format Detection

The CLI determines the file format in this order:

1. If `--template` is provided -> use the template file's extension
2. If `--js` flag is set -> JavaScript
3. If `--ts` flag is set or a `tsconfig.json` is found -> TypeScript
4. Otherwise -> JavaScript

Preserve the repo's established TS/JS convention unless the user explicitly asks for a different output format.

## Autogenerate Mode

Auto-generates a migration script by diffing the **schema** of two environments:

```bash
# Diff sandbox "staging" against primary environment
npx datocms migrations:new "sync staging changes" --autogenerate=staging

# Diff environment "foo" against environment "bar"
npx datocms migrations:new "sync foo to bar" --autogenerate=foo:bar
```

- `--autogenerate=foo` — finds changes in sandbox `foo` compared to the primary environment
- `--autogenerate=foo:bar` — finds changes in environment `foo` compared to environment `bar`

This is useful for capturing manual schema changes made in a sandbox and converting them into a reproducible migration script.

### Important limitation

`--autogenerate` is **schema-only**.

It does **not** include:

- records
- uploads/assets
- other content data that must be migrated manually

If the change requires records or uploads, write that part manually or extend the generated migration script afterward.

## Schema Types Flag

For TypeScript migrations, include schema type definitions for autocomplete and static checking:

```bash
# Include types for all models and blocks
npx datocms migrations:new "update schema" --ts --schema=all

# Include types for specific models only
npx datocms migrations:new "update blog" --ts --schema=blog_post,author
```

When `--schema` is used, the generated migration file includes:

- an additional `ItemTypeDefinition` import
- schema type definitions inserted before the migration function

This flag only works with TypeScript migrations.
