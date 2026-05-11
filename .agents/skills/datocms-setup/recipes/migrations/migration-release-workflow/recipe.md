_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `migration-release-workflow` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Migration Release Workflow Setup

You are an expert at turning a working DatoCMS CLI migration setup into a repeatable production release workflow. This recipe adds one local helper and, only when requested, one GitHub Actions workflow.

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
4. **Existing helper** — Check for `scripts/datocms-release.mjs`
5. **Existing workflow** — Check for `.github/workflows/datocms-release.yml`
6. **Existing scripts** — Check `package.json` for `datocms:release`

### Stop conditions

- If the project does not already have working CLI migration setup, stop and record `migrations` as a prerequisite and continue after it is applied.
- If a release helper already exists, patch it in place by default instead of replacing it wholesale.

## Step 2: Ask Questions

Ask one grouped question:

> "Do you want only the local release helper, or the local helper plus the optional GitHub Actions workflow? Recommended default: local helper only unless you explicitly want CI. If this repo has multiple CLI profiles and no clear release default, which profile should the helper target by default? Recommended default: preserve the strongest existing release or migration profile convention. If you skip the profile choice, I'll infer the strongest current default and mark any ambiguity under unresolved placeholders."

## Step 3: Load References

Read only these references:

- `../../../../datocms-cli/references/cli-setup.md`
- `../../../../datocms-cli/references/running-migrations.md`
- `../../../../datocms-cli/references/environment-commands.md`
- `../../../../datocms-cli/references/deployment-workflow.md`

Also inspect these bundled assets only when generating files:

- `scripts/datocms-release.mjs`
- `assets/datocms-release.github-actions.yml`

## Step 4: Generate Code

Generate only these project files:

1. **`scripts/datocms-release.mjs`** — Copy and adapt `scripts/datocms-release.mjs`
2. **`package.json` script** — Add `datocms:release`
3. **Optional GitHub Actions workflow** — If the user opted in, copy and adapt `assets/datocms-release.github-actions.yml` to `.github/workflows/datocms-release.yml`

### Required behavior

The local helper script must:

1. Require `--destination=<env>`
2. Accept optional `--profile=<id>`, `--dry-run`, `--skip-promote`, `--fast-fork`, `--force`, and passthrough `migrations:run` args after `--`
3. Run `maintenance:on` by default, and add `--force` only when explicitly requested
4. Run `migrations:run --destination=<env>` and forward `--profile`, `--fast-fork`, and passthrough args when present
5. Run `environments:promote <env>` unless `--skip-promote` is set
6. In `--dry-run` mode, run only `migrations:run --dry-run` and skip maintenance mode plus promotion
7. Always run `maintenance:off`, even after failures in the non-dry-run path

### Mandatory rules

- Use Node built-ins only in the helper script
- Preserve any existing CLI profile flags or source-environment defaults the repo already uses
- Keep the workflow GitHub-only in v1
- Do not add provider-specific CI beyond GitHub Actions
- Do not create additional helper scripts
- Do not default to `maintenance:on --force`; force is an explicit operator override
- Do not replace a working existing release workflow unless the user explicitly asked for a rewrite

## Step 5: Install Dependencies

Do not add any new dependencies for this setup unless the project is missing a required Node runtime package for its own existing scripts. The bundled helper must work with Node built-ins only.

## Step 6: Next Steps

After generating the files, tell the user:

1. Verify the destination environment naming convention used by the helper
2. Run a dry-run or sandbox rehearsal before using the production release flow
3. Use `--skip-promote` when they want to create a release environment without promoting it yet
4. Set the required DatoCMS token in their env file
5. Review the generated GitHub workflow secrets mapping if CI scaffolding was enabled
6. Whether the result is `scaffolded` or `production-ready`

Follow the shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including an explicit `Unresolved placeholders` section.

## Verification Checklist

Before presenting the result, verify:

1. `scripts/datocms-release.mjs` exists and keeps `maintenance:off` in the failure path for non-dry-run runs
2. `package.json` contains `datocms:release`
3. The helper requires `--destination` and documents the optional flags clearly
4. The helper uses `npx datocms`
5. The workflow file is created only when the user opted in
6. No non-GitHub CI files were added
