_Recipe for `datocms-setup`. Use only after parent skill selects `migrations` recipe and queues prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Migrations Setup

Expert at setting up DatoCMS CLI migrations in existing projects. Creates minimum migrations baseline on already-linked project. Does **not** install CLI or link project — `cli-bootstrap` prerequisite handles that.

Follow steps in order. Don't skip.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Install Dependencies
- Step 6: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Examine project:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals below.

1. **Node project** — Check `package.json`. If missing, stop: skill expects JS/TS project with package manifest.
2. **Bootstrap state** — Check `datocms` npm package installed and `datocms.config.json` exists with `siteId` in active profile. If either missing, surface `cli-bootstrap` as unmet prerequisite and stop — don't install CLI or touch `datocms.config.json` from this recipe.
3. **Migrations directory** — Check `migrations/`.
4. **TypeScript** — Check `tsconfig.json`.
5. **Scripts** — Check `package.json` for `datocms:migrations:run`, `datocms:migrations:dry-run`, `datocms:environments:list`.

### Stop conditions

- `package.json` missing: explain setup targets Node projects only.
- Repo already has materially different multi-profile CLI setup: patch in place by default, only ask if adopting single-project baseline would override working behavior.
- `datocms` not installed or active profile has no `siteId`: stop and route back to `cli-bootstrap` recipe.

## Step 2: Ask Questions

Infer from repo first.

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you do ask, make it one concise question, put recommended/default path first, explain whether skipping leaves placeholders, ownership, or project-specific values unresolved.

Only ask if existing `datocms.config.json` clearly uses multiple profiles, custom migration directories, custom migration template, custom migrations tsconfig, or other working conventions that single-project baseline would change.

When you do ask, keep it narrow: confirm whether current convention should be preserved in place or repo wants to normalize to default single-project baseline.

## Step 3: Load References

Read only these:

- `../../../../datocms-cli/references/cli-setup.md`
- `../../../../datocms-cli/references/creating-migrations.md`
- `../../../../datocms-cli/references/running-migrations.md`

## Step 4: Generate Code

Make minimum project changes for working migrations workflow on linked project.

### Required project changes

1. **Patch `datocms.config.json`** to add `migrations` block to active profile (created by `cli-bootstrap`):
   - `migrations.directory: "./migrations"`
   - `migrations.modelApiKey: "schema_migration"` Preserve `siteId`, `organizationId`, `logLevel`, and any existing fields.
2. **Create `migrations/`** if missing.
3. **Patch `package.json` scripts** to include exactly these helpers:
   - `datocms:migrations:run`
   - `datocms:migrations:dry-run`
   - `datocms:environments:list`

### Mandatory rules

- Use `npx datocms` in generated scripts
- Preserve existing scripts, merge changes in place
- Don't install `datocms` npm package — `cli-bootstrap` owns that
- Don't create or modify `datocms.config.json`'s `siteId` / `organizationId` / `apiTokenEnvName` — owned by `cli-bootstrap` (or, for CI-specific profiles, by `cli-profiles`)
- Don't write `DATOCMS_API_TOKEN=...` (or any CMA token placeholder) to `.env.example` — linked default profile resolves token via OAuth at runtime. Token-in-env setup belongs to CI-specific recipes, not interactive migrations baseline.
- Don't create custom migration template file
- Don't create migrations-specific tsconfig file
- Don't add CI files
- Don't create multiple CLI profiles

## Step 5: Install Dependencies

No new dependencies — `datocms` npm package installed by `cli-bootstrap`.

## Step 6: Next Steps

After generating files, tell user:

1. Create first migration with format matching repo:

   - TypeScript detected:

   ```bash
   npx datocms migrations:new "describe the change" --ts
   ```

   - JavaScript repo convention: omit `--ts`.

2. Dry-run before applying:

   ```bash
   npm run datocms:migrations:dry-run
   ```

3. Optional follow-up recipe id: `migration-release-workflow` for repeatable production rollout flow (may introduce CI-specific env token for unattended execution).

4. Optional follow-up recipe id: `blueprint-sync` when need one migration history shared across multiple DatoCMS projects.

## Verification Checklist

Before presenting result, verify:

1. `datocms.config.json` active profile has both `siteId` (from `cli-bootstrap`) and new `migrations` block
2. `migrations/` exists
3. `package.json` contains three required helper scripts
4. No `DATOCMS_API_TOKEN` placeholder written to `.env.example` by this recipe
5. No custom template, custom tsconfig, CI file, or multi-profile config added by default
