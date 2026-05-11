# Running Migrations

Executing pending migration scripts with `migrations:run`.

## Contents

- Inputs to confirm before running commands
- Command
- Default Behavior (Fork-and-Run)
- In-Place Execution
- Dry Run
- Migration Tracking
- File Discovery
- TypeScript Execution
- Legacy Client Support
- Return Value

## Inputs to confirm before running commands

Confirm these inputs when they are not already clear:

- source environment
- fork-and-run vs `--in-place`
- dry-run first vs real execution
- custom migrations dir / tracking model / migrations tsconfig, if the repo already uses them
- whether `--fast-fork` is needed for a large environment
- whether active editors make `--force` risky

## Command

```bash
npx datocms migrations:run [flags]
```

Runs migration scripts that have not been executed yet.

### Flags

| Flag | Type | Description |
| - | - | - |
| `--source=<env>` | string | Environment to fork from (defaults to primary) |
| `--destination=<env>` | string | Name for the new forked environment (exclusive with `--in-place`) |
| `--in-place` | boolean | Run in the source environment without forking (exclusive with `--destination`) |
| `--dry-run` | boolean | Simulate execution without making actual changes |
| `--fast-fork` | boolean | Use fast fork (prevents writes to source during fork) |
| `--force` | boolean | Force fast fork even with active editing sessions (requires `--fast-fork`) |
| `--migrations-dir=<path>` | string | Directory where migration scripts are stored |
| `--migrations-model=<key>` | string | API key of the model used to track migration data |
| `--migrations-tsconfig=<path>` | string | Path to tsconfig.json for running TS migrations |

## Default Behavior (Fork-and-Run)

By default, `migrations:run` forks the source environment into a new sandbox, then runs pending migrations on the fork:

```bash
# Fork primary → new sandbox, run migrations there
npx datocms migrations:run

# Fork primary → sandbox named "release-v2"
npx datocms migrations:run --destination=release-v2

# Fork a specific source environment
npx datocms migrations:run --source=staging --destination=staging-migrated
```

This is the safest approach: if migrations fail, the source environment is untouched.

## In-Place Execution

Run migrations directly on an environment without forking:

```bash
# Run on primary environment (use with caution)
npx datocms migrations:run --in-place

# Run on a specific sandbox
npx datocms migrations:run --source=staging --in-place
```

Use `--in-place` during local development iteration or when you've already forked manually.

## Dry Run

Preview which migrations would run without executing them:

```bash
npx datocms migrations:run --dry-run
```

## Migration Tracking

The CLI uses a DatoCMS model to track which migrations have already been executed. By default, this model has the API key `schema_migration`.

- Each migration that runs creates a record in this model
- On subsequent runs, only migrations without a corresponding record are executed
- Override the tracking model with `--migrations-model=<api_key>`

## File Discovery

The CLI discovers migration files by scanning the migrations directory for files matching:

```
/^\d+.*\.(js|ts)$/
```

Files must start with digits (the timestamp prefix). They are sorted by filename to determine execution order.

Default migrations directory: `./migrations/` (configurable via `--migrations-dir` or `datocms.config.json`).

## TypeScript Execution

TypeScript migrations are executed using `tsx`. If you have a custom tsconfig for migrations:

```bash
npx datocms migrations:run --migrations-tsconfig=tsconfig.migrations.json
```

Or configure it in `datocms.config.json`:

```json
{
  "profiles": {
    "default": {
      "migrations": {
        "tsconfig": "tsconfig.migrations.json"
      }
    }
  }
}
```

## Legacy Client Support

For backward compatibility with older DatoCMS client versions, the CLI also checks for migration files in a `legacyClient/` subdirectory within the migrations directory. These use the older client API signature.

New projects should always use the standard migrations directory.

## Return Value

The command returns the environment ID where migrations ran and the list of executed migration scripts:

```json
{
  "environmentId": "release-v2",
  "runMigrationScripts": ["1709312400_addBlogModel.ts", "1709312500_seedContent.ts"]
}
```
