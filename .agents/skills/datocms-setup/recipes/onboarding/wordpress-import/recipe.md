_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `wordpress-import` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS WordPress Import Setup

You are an expert at setting up the minimum repeatable workflow for importing WordPress content into DatoCMS through the CLI. This recipe keeps the setup provider-specific and lightweight: one plugin, one helper, one package script.

Follow these steps in order. Do not skip steps.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Silently examine the project:

Follow the shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect the recipe-specific signals below.

1. **Node project** — Check for `package.json`
2. **Package manager** — See `../../../patterns/MANDATORY_RULES.md`.
3. **Bootstrap state** — Confirm the `datocms` npm package is installed and the active profile has a `siteId` (owned by `cli-bootstrap`). If missing, surface `cli-bootstrap` as an unmet prerequisite and stop.
4. **WordPress plugin** — Check `package.json` for `@datocms/cli-plugin-wordpress`
5. **Environment files** — Check `.env.example`, `.env`, and `.env.local`
6. **Existing helper** — Check for `scripts/datocms-import-wordpress.mjs`
7. **Existing scripts** — Check `package.json` for `datocms:import:wordpress`

### Stop conditions

- If `package.json` is missing, stop and explain that this setup targets Node projects only.
- If `datocms` is not installed or the active profile has no `siteId`, stop and route back to `cli-bootstrap`.
- If an existing WordPress import helper follows a materially different flow, patch it in place by default and only ask if a rewrite would replace working behavior.

## Step 2: Ask Questions

Infer first from the repo.

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you do ask, make it one concise question, put the recommended/default path first, and explain whether skipping it will leave placeholders, ownership, or project-specific values unresolved.

Only ask if an existing WordPress import helper materially conflicts with the lean onboarding flow.

If the repo or request implies an existing target project rather than a fresh disposable import target, ask whether the destructive importer behavior is acceptable for that target and whether they want the safest available staged path (for example: an interactive run without `--autoconfirm`, limited flags, or a disposable rehearsal project first).

## Step 3: Load References

Read only these references:

- `../../../../datocms-cli/references/cli-setup.md`
- `../../../../datocms-cli/references/importing-content.md`

Also inspect this bundled asset only when generating files:

- `scripts/datocms-import-wordpress.mjs`

## Step 4: Generate Code

Generate only these project changes:

1. **Install missing packages**:
   - `@datocms/cli-plugin-wordpress` (the `datocms` npm package is installed by `cli-bootstrap`.)

2. **Patch `.env.example`** so it includes the WordPress provider credentials only (no DatoCMS token — `wordpress:import` authenticates through the linked default profile):

   ```env
   WORDPRESS_URL=https://example.com
   WORDPRESS_JSON_API_URL=https://example.com/wp-json
   WORDPRESS_USERNAME=your_username_here
   WORDPRESS_PASSWORD=your_password_here
   ```

3. **Create or patch `scripts/datocms-import-wordpress.mjs`** from `scripts/datocms-import-wordpress.mjs`

4. **Patch `package.json`** with `datocms:import:wordpress`

### Mandatory rules

- The helper must validate `WORDPRESS_USERNAME` and `WORDPRESS_PASSWORD`
- The helper must prefer `WORDPRESS_JSON_API_URL` when present
- The helper must fall back to `WORDPRESS_URL` when no JSON API URL is set
- The helper must forward extra CLI flags to `wordpress:import`
- The helper must not pass `--autoconfirm` by default
- Do not install the `datocms` npm package — `cli-bootstrap` owns that
- Do not add a `DATOCMS_API_TOKEN` placeholder to `.env.example` — the linked default profile handles DatoCMS auth for the `datocms wordpress:import` command
- Do not add CI files or multi-step orchestration around the import
- Do not add provider-mapping or transformation layers in this setup

## Step 5: Next Steps

After generating the files, tell the user:

1. Fill in the WordPress credentials locally (DatoCMS auth is already wired through the linked default profile)
2. Prefer `WORDPRESS_JSON_API_URL` when they already know the exact REST API endpoint
3. Run the helper once without `--autoconfirm` to review the import behavior
4. Add flags like `--ignore-errors`, `--concurrency`, or `--autoconfirm` only when they intentionally want those modes

## Verification Checklist

Before presenting the result, verify:

1. `@datocms/cli-plugin-wordpress` is installed or added
2. `.env.example` contains the WordPress placeholders and no new `DATOCMS_API_TOKEN` placeholder was added by this recipe
3. `scripts/datocms-import-wordpress.mjs` exists
4. `package.json` contains `datocms:import:wordpress`
5. The helper prefers `WORDPRESS_JSON_API_URL` over `WORDPRESS_URL`
6. The helper does not inject `--autoconfirm` by default
