_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `cli-bootstrap` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS CLI Bootstrap

You wire repos to DatoCMS projects so CLI commands and CMA operations authenticate via OAuth.

This is the canonical "CLI + link" bootstrap. Recipes needing CLI (`migrations`, `cma-types`, `contentful-import`, `wordpress-import`, `cli-profiles`, and dependents) declare this as prerequisite. Keep it single-purpose: install CLI, ensure OAuth session, link directory to DatoCMS project. No migration directories, `.env` placeholders, or package scripts here — downstream recipes handle those.

Follow these steps in order. Do not skip.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Drive the bootstrap
- Step 5: Install Dependencies
- Step 6: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Silently examine project:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals below.

1. **Node project** — Check `package.json`. If missing, stop: Node projects only.
2. **CLI installation** — Check `package.json` for `datocms` in `devDependencies` or `dependencies`.
3. **Existing CLI config** — Check `datocms.config.json` in repo root.
4. **Linked state** — Inspect active profile (default unless different profile in scope) for `siteId`. `siteId` = linked via OAuth; absence (or `apiTokenEnvName`-only profile) = work remains.
5. **OAuth session** — Run `npx datocms whoami` to confirm account authenticated. Non-zero exit or "Not logged in" = "no session".
6. **Environment files** — Check `.env.example`, `.env`, `.env.local`. Do not modify in this recipe. Token-in-env scaffolding belongs to downstream recipes running unattended.

### Stop conditions

- Missing `package.json` → stop.
- Active profile has valid `siteId` AND `npx datocms whoami` succeeds → already bootstrapped. Report and exit without changes.

## Step 2: Ask Questions

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Ask only when `npx datocms projects:list` returns multiple candidates and user intent does not clearly identify single project. Never silently pick fuzzy-match winner — wiring repo to wrong DatoCMS project = hard to detect, causes silent corruption.

When asking, keep narrow:

> "I can see N projects in your DatoCMS account. Which one should I link this repo to?"

Present candidates as numbered list with `id`, `name`, `domain`, workspace (`Personal account` or org name). Include "I want to pick a different one / cancel" escape hatch.

If only one candidate matches user hint, proceed without asking.

## Step 3: Load References

Read only these references:

- `../../../../datocms-cli/references/cli-setup.md`

## Step 4: Drive the bootstrap

Unlike feature recipes, this "generate" step = CLI invocations, not file writes. DatoCMS CLI writes `datocms.config.json` when `link` succeeds.

### Required actions

1. **Install `datocms`** if missing. Use project package manager (see `../../../patterns/MANDATORY_RULES.md`). Install as `devDependency` — CLI is development-time tool.
2. **Ensure OAuth session exists.** If `npx datocms whoami` fails, instruct user to run `npx datocms login` themselves. Agent cannot drive this step: opens browser for OAuth, requires interactive terminal. Wait for user confirmation before continuing.
3. **Discover accessible projects.** Run `npx datocms projects:list [hint] --json`, using best hint from conversation context (project name, domain). Parse JSON output.
4. **Pick the right project.**
   - One result → proceed.
   - Multiple results → ask user (see Step 2).
   - Zero results with hint → retry without hint; if still empty, surface full list and ask.
5. **Link the project.** Run `npx datocms link --site-id=<ID>`, adding `--organization-id=<ID>` when picked project belongs to organization. With `--site-id` set and OAuth credentials present, `link` runs without prompts and writes `datocms.config.json` with default profile populated (`siteId`, `organizationId`, `logLevel: NONE`, default migrations values — downstream recipes may customize).

### Mandatory rules

- Do not write `datocms.config.json` manually — always drive through `datocms link`. Writing by hand bypasses project validation, error-prone.
- Do not add CMA token placeholder to `.env.example` in this recipe.
- Do not create `migrations/` directory in this recipe.
- Do not patch `package.json` scripts in this recipe.
- Never silently auto-pick when `projects:list` returns multiple candidates. Present list, let user choose.
- Do not attempt to run `datocms login` on user's behalf — requires interactive browser flow.

## Step 5: Install Dependencies

Install only:

- `datocms` (devDependency)

No other package added by this recipe.

## Step 6: Next Steps

After project linked, report to user:

1. `datocms.config.json` now linked to `<project name>` (`<domain>`).
2. From here every CLI command (`cma:call`, `cma:script`, `cma:docs`, `migrations:*`, `schema:generate`, `environments:*`, ...) resolves project token automatically through OAuth. No env var, no token in chat.
3. Whether result is `scaffolded` (user still needs to run `datocms login` once before CLI works) or `production-ready` (login already in place, link succeeded).
4. **Recommended baseline next** — `cma-types`. Generates typed CMA schema definitions; default for any DatoCMS project that interacts with CMA in TypeScript, since it gives a fully typed experience end-to-end. Treat as standard project hygiene, not opt-in.
5. Optional follow-up recipe ids:
   - `migrations` — add CLI migrations workflow on top of bootstrap.
   - `cli-profiles` — add extra named profiles when repo manages multiple DatoCMS projects (e.g. blueprint + client projects).

Follow shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including explicit `Unresolved placeholders` section.

## Verification Checklist

Before presenting result, verify:

1. `datocms` present in `package.json` (devDependencies).
2. `datocms.config.json` exists and active profile has `siteId`.
3. `siteId` belongs to project user intended (if ambiguity possible, confirm user explicitly picked it).
4. No `.env.example`, `.env`, or `package.json` scripts modified by this recipe.
5. If `datocms login` not run yet, handoff note clearly states it is user's next step and tags result as `scaffolded`.
