_Internal recipe for `datocms-setup`. Use only after parent skill selects `site-search` recipe and queues prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Site Search Setup

Expert at DatoCMS Site Search. Combines Dato provisioning + local frontend wiring for working search route, explicit index wiring, least-privilege tokens.

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

Follow steps in order. No skipping.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate code
- Step 5: Final handoff
- Verification checklist

## Step 1: Detect Context (silent)

Silently examine project:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals:

1. **Framework and UI stack** — use `../../../references/repo-conventions.md` for framework detection, then inspect whether `react-datocms`, `vue-datocms`, `@datocms/svelte`, or `@datocms/astro` installed. If none match, infer React-based, Vue-based, or other.
2. **CMA client packages** — Check `@datocms/cma-client`, `@datocms/cma-client-node`, `@datocms/cma-client-browser`
3. **Existing search UI** — Search `/search` routes, `useSiteSearch`, `searchResults.rawList`, existing search components
4. **Existing Dato helpers** — Search shared `executeQuery` wrapper, Dato lib folder, existing env helpers
5. **Environment files** — Check `.env.example`, `.env`, `.env.local`, framework-specific env conventions for: CMA-capable token, public search token, search index id, public site URL
6. **Public route structure** — Inspect repo for distinct top-level public sections like `/blog`, `/docs`, `/help`
7. **Existing search topology** — If repo has Site Search wiring, inspect whether one shared index or multiple

### Stop conditions

- Framework undetermined? Ask user which stack.
- Repo has materially different search integration? Patch in place by default, don't replace wholesale.

## Step 2: Ask Questions

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Ask only if unresolved decision after inspection:

1. **Index topology** — repo exposes multiple public sections, ambiguous whether one shared index or split.

   Ask:

   > "This repo appears to expose multiple top-level public sections. Should Site Search use one shared search index or separate indexes per section? Recommended default: one shared search index unless you already need separate crawling boundaries or search experiences. If you skip, I'll keep or create one shared index and mark any additional topology assumptions under unresolved placeholders."

2. **Search-route ownership** — existing `/search` route has conflicting ownership, patching safely unclear.

   Ask:

   > "This repo already has more than one possible `/search` owner. Which route or component should I patch? Recommended default: preserve the currently mounted public `/search` route. If you skip, I'll patch the strongest existing public owner and list the others under unresolved placeholders."

Neither applies? Proceed.

## Step 3: Load References

Read only needed:

- `../../../../datocms-frontend-integrations/references/site-search-api.md`
- `../../../../datocms-cma/references/client-types-and-behaviors.md`
- `../../../../datocms-cma/references/access-control.md`

Then load framework-appropriate search UI reference:

| Stack | Reference |
| - | - |
| React / Next.js | `../../../../datocms-frontend-integrations/references/react-site-search.md` |
| Vue / Nuxt | `../../../../datocms-frontend-integrations/references/vue-site-search.md` |
| SvelteKit / Astro / unsupported UI stack | `../../../../datocms-frontend-integrations/references/site-search-api.md` |

## Step 4: Generate code

Generate full setup. Dato-side automation first when CMA-capable token available.

### Dato-side automation

If CMA-capable token exists, attempt remote setup in order:

1. inspect existing search indexes
2. inspect roles and access tokens
3. create or update one least-privilege search role with `can_perform_site_search: true`
4. create or update one access token bound to that role
5. create or update search indexes using selected topology:
   - preserve multiple existing indexes if Dato project already uses them intentionally
   - default new setups to one shared index
   - only create multiple new indexes when repo or user decision clearly requires separate crawling boundaries
   - when multiple indexes used, make distinction explicit in naming and any `user_agent_suffix` strategy
6. trigger indexing after creating or materially updating an index

Remote automation blocked by missing permissions like `can_manage_search_indexes` or `can_manage_access_tokens`? Continue with local scaffolding, mark result `scaffolded`.

### Local project changes

Generate only minimum local files for working search:

1. **Install missing packages**
   - React / Next.js: `react-datocms`, `@datocms/cma-client-browser`
   - Vue / Nuxt: `vue-datocms`, `@datocms/cma-client-browser`
   - Other stacks: suitable CMA client package for runtime used by generated helper
2. **Patch env placeholders**
   - public search token
   - public search index id
   - public site URL if project doesn't already define it
3. **Create or patch shared search helper**
   - React / Vue widget stacks may keep helper thin
   - SvelteKit / Astro / unsupported stacks must use `client.searchResults.rawList()`
4. **Create or patch `/search` route**
   - React and Vue stacks render real search UI using `useSiteSearch`
   - Other stacks render framework-native page backed by generated helper
5. **Reuse existing Dato lib conventions** for file placement instead of inventing parallel structures

### Public env var conventions

Use framework's public env prefix:

- Next.js: `NEXT_PUBLIC_DATOCMS_SITE_SEARCH_TOKEN`, `NEXT_PUBLIC_DATOCMS_SITE_SEARCH_INDEX_ID`, `NEXT_PUBLIC_SITE_URL`
- Nuxt: `NUXT_PUBLIC_DATOCMS_SITE_SEARCH_TOKEN`, `NUXT_PUBLIC_DATOCMS_SITE_SEARCH_INDEX_ID`, `NUXT_PUBLIC_SITE_URL`
- SvelteKit: `PUBLIC_DATOCMS_SITE_SEARCH_TOKEN`, `PUBLIC_DATOCMS_SITE_SEARCH_INDEX_ID`, `PUBLIC_SITE_URL`
- Astro: `PUBLIC_DATOCMS_SITE_SEARCH_TOKEN`, `PUBLIC_DATOCMS_SITE_SEARCH_INDEX_ID`, `PUBLIC_SITE_URL`

Only add variables that don't exist. Preserve existing values.

### Mandatory rules

- Always pass explicit `search_index_id`
- Never expose CMA-capable token in browser code
- Default to one search index unless repo clearly needs more or user explicitly chooses multiple
- Preserve existing `/search` page, patch in place where possible
- Keep search result highlighting in presentation layer; don't store rendered HTML in helpers
- When remote automation fails, report exact missing permission or credential instead of silently dropping Dato-side step

### Output status

- Report `scaffolded` if any search token or index id still placeholder, if `/search` route not fully mounted, if Dato-side automation couldn't complete, if additional index-topology assumptions remain unresolved
- Report `production-ready` only when mounted search route uses real values and any attempted Dato-side automation completed without unresolved TODOs

## Step 5: Final handoff

After generating files, tell user:

1. which Dato-side resources were created or reused
2. whether Site Search now uses one index or multiple
3. which env vars still need real values, if any
4. how to trigger fresh indexing pass if content hasn't been crawled yet

Follow shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including explicit `Unresolved placeholders` section.

## Verification checklist

Before presenting result, verify:

1. search UI exists at mounted `/search` route
2. React / Vue stacks use `useSiteSearch`
3. SvelteKit / Astro / unsupported stacks use `client.searchResults.rawList()`
4. `search_index_id` explicit in every search request
5. browser code uses only public search token, never CMA token
6. missing `can_manage_search_indexes` or `can_manage_access_tokens` called out explicitly when remote automation fails
7. final handoff includes explicit `Unresolved placeholders` section
