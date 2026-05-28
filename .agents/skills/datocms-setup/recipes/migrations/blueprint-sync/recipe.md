_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `blueprint-sync` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Blueprint Sync Setup

You are an expert at configuring one shared DatoCMS migration history across multiple projects by using CLI profiles. This recipe adds the minimum profile and helper-script scaffolding needed for repeatable multi-project rollout.

Follow these steps in order. Do not skip steps.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Install Dependencies
- Step 6: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Silently examine the project:

Follow the shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect the recipe-specific signals below.

1. **Node project** — Check for `package.json`
2. **Package manager** — See `../../../patterns/MANDATORY_RULES.md`.
3. **CLI setup** — Check for the `datocms` npm package, `datocms.config.json`, and a `migrations/` directory or existing migration scripts
4. **Existing profiles** — Inspect `datocms.config.json` for named profiles and their migrations directories
5. **Environment files** — Check `.env.example`, `.env`, and `.env.local`
6. **Existing helper** — Check for `scripts/datocms-sync-projects.mjs`
7. **Existing workflow** — Check for `.github/workflows/datocms-sync-projects.yml`
8. **Existing scripts** — Check `package.json` for `datocms:sync:projects`

### Stop conditions

- If the project does not already have working CLI migration setup, stop and record `migrations` as a prerequisite and continue after it is applied.
- If the repo already has a materially different multi-profile scheme, patch it in place instead of normalizing it.

## Step 2: Ask Questions

Ask one grouped follow-up:

> "Which CLI profile id should be the blueprint source, and which profile ids should be the destination projects? Do you also want the optional GitHub Actions template for the sync helper? Recommended default: no unless you explicitly want CI rollout. Were the destination projects duplicated from the blueprint, or should I keep entity-id alignment as an explicit assumption to preserve? Recommended default: if the repo does not prove duplication, preserve alignment as an explicit assumption and mark the rollout `scaffolded` until you confirm it."

If the user does not specify custom migration directories, keep or create one shared `./migrations` directory for all profiles.

## Step 3: Load References

Read only these references:

- `../../../../datocms-cli/references/cli-setup.md`
- `../../../../datocms-cli/references/running-migrations.md`
- `../../../../datocms-cli/references/blueprint-sync.md`

Also inspect these bundled assets only when generating files:

- `scripts/datocms-sync-projects.mjs`
- `assets/datocms-sync.github-actions.yml`

## Step 4: Generate Code

Generate only these project changes:

1. **Patch `datocms.config.json`** with the blueprint profile and destination profiles

2. **Patch `.env.example`** with one token placeholder per named profile:

   ```env
   DATOCMS_BLUEPRINT_PROFILE_API_TOKEN=your_token_here
   DATOCMS_CLIENT_A_PROFILE_API_TOKEN=your_token_here
   ```

3. **Create or patch `scripts/datocms-sync-projects.mjs`** from `scripts/datocms-sync-projects.mjs`

4. **Patch `package.json`** with `datocms:sync:projects`

5. **Optional GitHub Actions workflow** — If the user opted in, copy and adapt `assets/datocms-sync.github-actions.yml` to `.github/workflows/datocms-sync-projects.yml`

### Mandatory rules

- Default every new profile to the same shared `./migrations` directory
- Preserve existing per-profile migrations directories if the repo already uses them and the user did not ask to change them
- Use one helper script instead of adding many profile-specific package scripts
- The helper may support `--dry-run`, `--source=<env>`, `--destination-template=<template>`, `--fast-fork`, and explicit `--force`, but it must not auto-promote by default
- Do not infer project mappings from external systems or remote APIs
- Do not create one migrations directory per project unless the repo already follows that pattern

## Step 5: Install Dependencies

Do not add any new dependencies for this setup unless the repo already depends on a helper runtime outside Node built-ins. The bundled helper must work with Node built-ins only.

## Step 6: Next Steps

After generating the files, tell the user:

1. Fill in the per-profile tokens in their local env file
2. Test the helper with a dry-run before using it for real rollout
3. Use `--destination-template` or `--source` only when the rollout needs something other than the default pattern
4. Promote destination environments manually after review
5. Whether the result is `scaffolded` or `production-ready`
6. Optional follow-up recipe id: `migration-release-workflow` when they want a promote-included release helper for a single project

Follow the shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including an explicit `Unresolved placeholders` section.

## Verification Checklist

Before presenting the result, verify:

1. `datocms.config.json` contains the requested named profiles
2. New profiles default to one shared `./migrations` directory unless an existing different convention was preserved
3. `.env.example` contains token placeholders for each named profile
4. `scripts/datocms-sync-projects.mjs` exists
5. `package.json` contains `datocms:sync:projects`
6. The helper does not auto-promote by default
7. The helper can accept runtime source/destination options without auto-promoting
8. The workflow file is created only when the user opted in
