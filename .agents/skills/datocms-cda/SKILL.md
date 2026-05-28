---
name: datocms-cda
description: >-
  Query the DatoCMS Content Delivery API (CDA) — the read-only GraphQL API —
  using @datocms/cda-client. Use when users ask for GraphQL content reads:
  fetching posts/pages/projects, filtering by date/text/fields, sorting/order,
  pagination/load-more, text pattern matching via regex filters, localization and fallback locales,
  modular content fragments, Structured Text (DAST) with blocks/inline records,
  responsive images (srcset/blur-up/imgix), SEO metadata (_seoMetaTags, favicons,
  global SEO), video/Mux fields, draft or preview reads, environment-targeted
  reads, cache tags via rawExecuteQuery, and Content Link metadata for visual
  editing. Also use for CDA query type generation with gql.tada or GraphQL Code
  Generator.
---

# DatoCMS Content Delivery API Skill

Expert at querying DatoCMS CDA (read-only GraphQL) using `@datocms/cda-client`. Follow steps in order.

## Step 1: Detect Context

If context already established, skip broad detection. Re-inspect only when needed.

Examine project setup:

1. Read `package.json` for `@datocms/cda-client`. Not installed? `npm install @datocms/cda-client`

2. Find existing `executeQuery` or `rawExecuteQuery` imports to understand usage patterns.

3. Check `.env`, `.env.local` for DatoCMS API token:
   - `DATOCMS_CDA_TOKEN`
   - `DATOCMS_READONLY_TOKEN`
   - `DATOCMS_API_TOKEN`
   - `NEXT_PUBLIC_DATOCMS_CDA_TOKEN`

4. Check framework (Next.js, Astro, Remix, Nuxt, SvelteKit) to determine server vs client queries. Don't expose tokens to browser unless using public read-only token.

5. Check type generation setup:
   - **gql.tada:** `gql.tada` in dependencies + `initGraphQLTada` call (typically `lib/datocms/graphql.ts`)
   - **graphql-codegen:** `@graphql-codegen/cli` in devDependencies + `graphql.config.ts`
   - Context only — match existing setup. Don't suggest setting up type generation.

**CDA only needs read-only token**. If `DATOCMS_API_TOKEN` is also used for CMA, better suggesting a separate read-only token for CDA.

## Step 2: Understand Task

Classify task:

| Category | Examples |
| - | - |
| **Basic querying** | Fetch by slug/ID, single-instance, list collections |
| **Filtering** | Field filters, AND/OR, meta filters, deep filtering |
| **Pagination & ordering** | Paginate, sort, tree/hierarchical |
| **Localization** | Localized fields, fallback, all-locale values |
| **Modular content** | Block fields with fragments, nested blocks |
| **Structured text** | DAST value/blocks/links, render |
| **Images & media** | Responsive images, imgix, placeholders, focal, video |
| **SEO & meta** | `_seoMetaTags`, favicons, `globalSeo`, OG tags |
| **Draft/preview & caching** | Draft mode, strict mode, cache tags, CDN, Content Link |
| **Type generation** | gql.tada, graphql-codegen, schema types, typed queries |

Clear request? Proceed directly.

## Step 3: Load References

Read relevant references from `references/`. **Always** load core client reference, then only relevant files.

**Always load:**

- `references/client-and-config.md` — client setup, options, error handling, limits, scalars

**Load per category:**

| Task | Reference |
| - | - |
| Basic (records, collections, meta) | `references/querying-basics.md` |
| Filtering (fields, AND/OR, deep, uploads) | `references/filtering.md` |
| Pagination & ordering (first/skip, auto, trees) | `references/pagination-and-ordering.md` |
| Localization | `references/localization.md` |
| Modular content (blocks, fragments) | `references/modular-content.md` |
| Structured text (DAST, render) | `references/structured-text.md` |
| Images & media (responsiveImage, video) | `references/images-and-videos.md` |
| SEO & meta | `references/seo-and-meta.md` |
| Draft/preview, cache, environments, Content Link | `references/draft-caching-environments.md` |
| Type generation (gql.tada, graphql-codegen, types) | `references/type-generation.md` |
| gql.tada fragment discipline (masking, composition, page query) | `references/fragment-patterns.md` |

**Cross-cutting:**

- Filtering localized → `references/localization.md`
- Structured text with modular content → `references/modular-content.md`
- Images in blocks → `references/images-and-videos.md`
- Paginating filtered collection → `references/pagination-and-ordering.md`
- Complex nesting → `references/pagination-and-ordering.md` for complexity costs
- Writing/extending fragments in a `gql.tada` project → `references/fragment-patterns.md`

## Step 4: Mandatory Rules to Generate Code

### Client Usage

- **Default: `executeQuery`** from `@datocms/cda-client` (or repo's existing wrapper around it)
- Use `buildRequestHeaders()` / `buildRequestInit()` for framework `fetch` integration, tagging, custom plumbing
- Use **`executeQueryWithAutoPagination`** to fetch 500+ records
- Use **`rawExecuteQuery`** only if response headers are needed (cache tags)
- Store API token in env variable — never hardcode

### GraphQL Queries

- Write as **template literal strings** (unless project uses `TypedDocumentNode` / `gql.tada`)
- Use **GraphQL variables** for all dynamic values — no string interpolation
- Request **only needed fields** — don't over-fetch
- Use DatoCMS custom scalars in declarations (`$first: IntType`, `$id: ItemId`)
- Prepend template string with `/* GraphQL */` (comment-tagged templates) for syntax highlighting

```js
const query = /* GraphQL */ `query { ... }`
```

### Structured Text

- Query **all relevant sub-fields** (`value`, `blocks`, `links`, `inlineBlocks`) — omitting causes silent data loss

### Error Handling

- Catch `ApiError` from `@datocms/cda-client` at appropriate boundaries
- **No custom retry logic** — `autoRetry` handles rate limits

### TypeScript

- Follow strictness: no `as unknown as`, no unnecessary `as`
- Let TypeScript infer types
- Use `import type { ... }` for type-only imports

## Step 5: Verify

Before presenting final code:

1. **Token** — env variable, read permissions
2. **Error handling** — `ApiError` caught at boundaries
3. **Pagination** — 500+ records? use `executeQueryWithAutoPagination`
4. **Draft mode** — `includeDrafts` intentional (not exposing unpublished in prod)
5. **`excludeInvalid`** — recommend for stable schemas. Changing schema? use `filter: { _isValid: { eq: true } }` instead
6. **Type safety** — no `as` to silence errors
7. **Imports** — CDA from `@datocms/cda-client`; keep generated GraphQL helpers if type-gen wired
8. **Variables** — all dynamic via GraphQL variables, no interpolation
9. **Structured text** — all relevant sub-fields included
10. **Fetch integration** — framework-native `fetch`? use `buildRequestHeaders()` / `buildRequestInit()`
11. **Type generation** — gql.tada or graphql-codegen? use project's `graphql()` function, check scalar mappings
12. **gql.tada fragment discipline** — masked-by-default, `readFragment()` at boundary, imports mirror spreads (see `references/fragment-patterns.md`)

## Cross-Skill Routing

This skill covers **reading via GraphQL CDA**. Route to companion skill for:

| Condition | Route to |
| - | - |
| Mutating content, schema/uploads/webhooks, scripts (including REST queries) | **datocms-cma** |
| Draft mode endpoints, Web Previews, Content Link, subscriptions, cache tags | **datocms-frontend-integrations** |
| Building plugin | **datocms-plugin-builder** |
