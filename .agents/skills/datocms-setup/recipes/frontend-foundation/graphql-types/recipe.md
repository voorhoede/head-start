_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `graphql-types` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS GraphQL Type Generation Setup

You are an expert at setting up TypeScript type generation for DatoCMS GraphQL queries. This recipe configures only CDA query typing. It does not configure CMA schema types.

Follow these steps in order. Do not skip steps.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate code
- Step 5: Install dependencies
- Step 6: Final handoff
- Verification checklist

## Step 1: Detect Context (silent)

Silently examine the project:

Follow the shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect the recipe-specific signals below.

1. **Framework** — Read `package.json` and check for:
   - `next` -> Next.js
   - `nuxt` -> Nuxt
   - `@sveltejs/kit` -> SvelteKit
   - `astro` -> Astro
2. **Existing typegen** — Check for:
   - `gql.tada` in `package.json`
   - `@graphql-codegen/cli` in `package.json`
   - `graphql.config.ts`
   - `schema.graphql`
   - an existing `graphql.ts` init file
   - generated GraphQL outputs already committed in the repo
3. **Existing scripts** — Check `package.json` for `generate-schema` and `generate-ts-types`
4. **Env files** — Check `.env`, `.env.local`, and `.env.example` for the published CDA token
5. **File structure** — Determine whether the project uses `src/`

### Stop conditions

- If the framework cannot be determined, ask the user.
- If the project already has a materially different type-generation setup, inspect and patch it in place by default instead of replacing it.

## Step 2: Ask Questions

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Decision rules:

- If the repo already clearly uses `gql.tada`, preserve `gql.tada`
- If the repo already clearly uses GraphQL Code Generator, preserve GraphQL Code Generator
- If the repo uses neither approach, default to `gql.tada`

Only ask if:

- both approaches coexist and ownership is unclear, or
- the user explicitly asks to choose between them

In that case, ask one question:

> "This repo appears compatible with both gql.tada and GraphQL Code Generator. Which approach should I keep as the source of truth? Recommended default: gql.tada for a new or simplified setup; preserve Code Generator only when the repo already depends on a `.graphql`-file workflow. If you skip, I'll keep the repo's strongest existing convention, or fall back to gql.tada if neither one clearly owns the setup."

Do not ask about CMA types here. If the user later wants CMA schema types, keep that as the optional `cma-types` follow-up recipe.

## Step 3: Load References

Read only this reference:

- `../../../../datocms-cda/references/type-generation.md`

## Step 4: Generate code

Generate the files and scripts required by the selected or inferred approach using the framework-specific paths and env conventions from the reference.

### For gql.tada

Create or patch:

1. `generate-schema` in `package.json`
2. `tsconfig.json` plugin configuration
3. the `graphql.ts` init file
4. `schema.graphql` by running the generation script if the published CDA token is already available

### For GraphQL Code Generator

Create or patch:

1. `graphql.config.ts`
2. `generate-ts-types` in `package.json`
3. generated types output only when the repo already has matching `.graphql` documents or the user explicitly uses that workflow

### Mandatory rules

- Make targeted additions instead of full rewrites
- Preserve working existing scripts and config where possible
- Do not add CMA schema generation here
- Do not add `generate-cma-types` here
- Default greenfield setups to `gql.tada`

## Step 5: Install dependencies

Install only the dependencies required by the selected approach:

### gql.tada

- `gql.tada`
- `dotenv-cli`
- `@0no-co/graphqlsp` for SvelteKit only

### GraphQL Code Generator

- `graphql`
- `dotenv-cli`
- `@graphql-codegen/cli`
- the supporting codegen packages required by the reference

Use the detected package manager.

## Step 6: Final handoff

After generating the files, tell the user:

1. which approach now owns GraphQL query typing
2. whether any schema or generated output still depends on local tokens or missing documents
3. the optional follow-up recipe id `cma-types` if they also want CMA schema types

Follow the shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including an explicit `Unresolved placeholders` section.

## Verification checklist

Before presenting the result, verify:

1. the chosen or inferred approach is fully configured
2. the generated files match the detected framework and `src/` layout
3. existing config and scripts were patched in place instead of rewritten
4. no CMA-specific scripts, env vars, or references were added
5. no unnecessary choice question was asked when the repo already had a clear owner
