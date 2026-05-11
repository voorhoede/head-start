_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `cma-types` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS CMA Type Generation Setup

You are an expert at setting up standalone CMA schema type generation on top of an already-linked project. This skill configures only the `schema:generate` workflow and does not overlap with GraphQL query type-generation setup.

`schema:generate` authenticates via the OAuth-linked default profile from `cli-bootstrap` — no CMA token in `.env`, no `dotenv-cli` wrapper.

Follow these steps in order. Do not skip steps.

## Step 1: Detect Context (silent)

Silently examine the project:

Follow the shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect the recipe-specific signals below.

1. **Framework and file layout** — use `../../../references/repo-conventions.md` for supported framework detection and `src/` usage.
2. **Node project** — Confirm `package.json` exists.
3. **Bootstrap state** — Confirm the `datocms` npm package is installed and the active profile has a `siteId` (owned by `cli-bootstrap`). If missing, surface `cli-bootstrap` as an unmet prerequisite and stop.
4. **Existing script** — Check `package.json` for `generate-cma-types`.
5. **Existing output** — Check for `src/lib/datocms/cma-types.ts` or `lib/datocms/cma-types.ts`.

### Stop conditions

- If the framework cannot be determined, ask the user.
- If `datocms` is not installed or the active profile has no `siteId`, stop and route back to `cli-bootstrap`.
- If the repo already has a materially different schema-type generation setup, inspect and patch it in place by default instead of replacing it.

## Step 2: Ask Questions

Infer first from the repo.

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you do ask, make it one concise question, put the recommended/default path first, and explain whether skipping it will leave placeholders, ownership, or project-specific values unresolved.

Only ask if the project already has a conflicting CMA type-generation flow and patching it safely is unclear.

## Step 3: Load References

Read only these references:

- `../../../../datocms-cli/references/cli-setup.md`
- `../../../../datocms-cma/references/type-generation.md`

## Step 4: Generate Code

Generate only the standalone CMA type-generation setup.

### Required project changes

1. **Patch `package.json`** with a `generate-cma-types` script that invokes `npx datocms schema:generate <output-path>`. No `dotenv-cli` wrapper, no explicit `--api-token` — the linked default profile handles auth.
2. **Choose the output path**:
   - Next.js / Astro / SvelteKit with `src/`: `src/lib/datocms/cma-types.ts`
   - Next.js / Astro / SvelteKit without `src/`: `lib/datocms/cma-types.ts`
   - Nuxt: `lib/datocms/cma-types.ts`
3. **Run the initial generation** via the new script. With the default profile linked via OAuth, no token prompt or env lookup is needed.

### Mandatory rules

- Configure only CMA schema types
- Do not configure gql.tada
- Do not configure GraphQL Code Generator
- Preserve an existing working script name if the repo already uses one, but ensure `generate-cma-types` exists
- Do not install the `datocms` npm package — `cli-bootstrap` owns that
- Do not install `dotenv-cli` — unnecessary with OAuth-linked profile
- Do not add any CMA token placeholder to `.env.example` for `schema:generate`. `schema:generate` uses the default profile's OAuth resolution.

## Step 5: Next Steps

After generating the files, tell the user:

1. Re-run `generate-cma-types` after schema changes
2. Generated module is the source of truth for a fully typed CMA experience: typed payloads on simplified `client.items.*` calls, `RawApiTypes.Item<Schema.AnyModel>` typing on raw items, `Schema.X.ID` / `Schema.X.REF` runtime constants instead of hardcoded model ids — useful anywhere code switches on `__itemTypeId` (e.g. `recordToWebsiteRoute`) or builds `item_type` references.
3. Optional follow-up recipe id: `graphql-types` if they also want typed CDA queries

## Verification Checklist

Before presenting the result, verify:

1. `package.json` contains `generate-cma-types`
2. The output path matches the detected framework and `src/` layout
3. The script uses `npx datocms schema:generate` without a `dotenv` wrapper or an explicit `--api-token` flag (OAuth via the linked default profile)
4. No CMA token placeholder was added to `.env.example` by this recipe
5. `dotenv-cli` was not added as a dependency
6. No GraphQL query type-generation setup was added by this skill
