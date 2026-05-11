_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `cache-tags` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Cache Tags Setup

You are an expert at setting up DatoCMS cache tag invalidation. This recipe generates the files needed for granular cache invalidation — only pages affected by a content change are purged, instead of revalidating all DatoCMS content on every change.

Two approaches:

- **Next.js:** `rawExecuteQuery` with `queryId` → store tags in DB → `revalidateTag()` on webhook
- **Nuxt / SvelteKit / Astro:** `rawExecuteQuery` → CDN response headers → webhook calls CDN purge API

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

| CDN | Response header |
| - | - |
| Netlify / Cloudflare | `Cache-Tag` |
| Fastly | `Surrogate-Key` |
| Bunny | `CDN-Tag` |

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Install Dependencies
- Step 6: Environment Variables
- Step 7: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Follow `../../../references/repo-conventions.md`, then inspect:

1. **Framework and file layout** — use `../../../references/repo-conventions.md`
2. **Prerequisite: executeQuery wrapper** — search for existing `executeQuery` wrapping `@datocms/cda-client`. If missing, record `cda-client` as prerequisite and continue after wrapper is applied.
3. **Existing cache tag setup** — check for:

   - Next.js: `executeQuery` using `rawExecuteQuery` with `queryId`, or `cache-tags-db` module
   - Nuxt: `useQueryWithCacheTags` or `fetchWithCacheTags`
   - SvelteKit: `performQueryWithCacheTags`
   - Astro: `executeQueryWithCacheTags`
   - Any framework: webhook handler for cache invalidation

   If configured, inspect and update in place. Only ask for replacement if incompatible or user requests rewrite.
4. **Astro SSR requirement** — check `astro.config.mjs` for `output: 'server'` or `'hybrid'`. Cache tags require SSR. Warn if `'static'` or not set.
5. **Installed deps** — check `package.json` for `@datocms/cda-client`

**Stop conditions:**

- No `executeQuery` wrapper → record `cda-client` as prerequisite
- Cache tags already configured → inspect and update in place

## Step 2: Ask Questions

Infer from repo first. Follow `../../../patterns/MANDATORY_RULES.md`. Ask zero questions only when hosting choice is obvious.

**Next.js:** No clear cache-tag database signal:

> "Which cache-tag storage should I scaffold for this Next.js app: Turso, Vercel Postgres, or a placeholder adapter? Recommended default: preserve the strongest existing repo signal; otherwise use a placeholder adapter and mark the result `scaffolded`. If you skip, I'll follow that default."

**Nuxt / SvelteKit / Astro:** No clear CDN target:

> "Which CDN should I target for cache-tag purging: Netlify or Cloudflare, Fastly, Bunny, or a placeholder adapter? Recommended default: preserve the strongest existing hosting signal; otherwise scaffold the generic `Cache-Tag` path and mark the result `scaffolded`. If you skip, I'll follow that default."

This determines both the response-header name and the webhook handler's purge pattern.

## Step 3: Load References

**Always load:**

- `../../../../datocms-cda/references/draft-caching-environments.md`

**Load per framework (`## Cache Tags (Optional)` section):**

| Framework | Reference file |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro.md` |

## Step 4: Generate Code

Generate framework-specific cache tag invalidation files following the patterns in the loaded references.

### Next.js (App Router)

1. **Update `executeQuery`** at `src/lib/datocms/executeQuery.ts`:
   - Use `rawExecuteQuery` instead of `executeQuery`
   - Accept optional `queryId`
   - With `queryId`: `returnCacheTags: true`, read `x-cache-tags` header, store via `cacheTagsDb.storeTags()`, tag fetch with `[queryId]`
   - Without `queryId`: fallback to single `cacheTag = 'datocms'` (backward compatible)
   - Wrap in React `cache()`
   - Use `requestInitOptions: { cache: 'force-cache', next: { tags } }`

2. **Create `cache-tags-db.ts`** in same directory:
   - `CacheTagsDb` interface: `storeTags(queryId, tags)`, `findQueryIdsForTags(tags)`
   - `query_cache_tags(query_id TEXT, tag TEXT)` join table
   - Implementation for chosen DB (Turso with `@libsql/client`, Vercel Postgres with `@vercel/postgres`, or placeholder)
   - Auto-create table on first use

3. **Create webhook handler** at `src/app/api/revalidate/route.ts`:
   - Validate `Authorization: Bearer <CACHE_INVALIDATION_WEBHOOK_SECRET>`
   - Read tags from `body?.entity?.attributes?.tags`
   - Call `revalidateTag('datocms', { expire: 0 })` for global tag (`{ expire: 0 }` = immediate expiration, required for webhook-driven invalidation)
   - Look up affected `queryId`s via `cacheTagsDb.findQueryIdsForTags(tags)`
   - Call `revalidateTag(queryId, { expire: 0 })` for each

### Nuxt

1. **Create `fetchWithCacheTags`** at `server/middleware/cache-tags.ts` or `server/utils/cache-tags.ts`:

   - Accept query and optional variables
   - Call `rawExecuteQuery` with `returnCacheTags: true`
   - Read `x-cache-tags` header
   - Return `{ data, cacheTags }`
   - Use `useRuntimeConfig().public.datocmsPublishedContentCdaToken`

   Optional composable at `composables/useQueryWithCacheTags.ts`.

2. **Create usage pattern** — Show using `fetchWithCacheTags` in server route/page, setting CDN header via `setResponseHeader(event, 'Cache-Tag', cacheTags)` (or `Surrogate-Key` / `CDN-Tag`). For pages, use `useRequestEvent()`.

3. **Create webhook handler** at `server/api/invalidate-cache.ts`:
   - Validate `Authorization: Bearer <cacheInvalidationWebhookSecret>` from `useRuntimeConfig()`
   - Read tags from `body?.entity?.attributes?.tags`
   - Call CDN purge API (commented examples for Fastly, Netlify, Cloudflare, Bunny)

4. **Add runtime config** to `nuxt.config.ts`:
   ```ts
   runtimeConfig: {
     cacheInvalidationWebhookSecret: '',
     // CDN-specific (uncomment for your CDN):
     // fastlyServiceId: '',
     // fastlyKey: '',
   }
   ```

### SvelteKit

1. **Create `performQueryWithCacheTags`** at `src/lib/datocms/queries.ts`:
   - Accept `RequestEvent`, query, optional variables
   - Preserve draft-mode token switching if existing wrapper supports it
   - Call `rawExecuteQuery` with `returnCacheTags: true`
   - Read `x-cache-tags` header
   - Return `{ data, cacheTags }`
   - Use `$env/dynamic/private` for tokens

2. **Create usage pattern** — Show using in `+page.server.ts` load function, calling `event.setHeaders({ 'Cache-Tag': cacheTags })` (or `Surrogate-Key` / `CDN-Tag`)

3. **Create webhook handler** at `src/routes/api/invalidate-cache/+server.ts`:
   - Export `POST` as `RequestHandler`
   - Validate `Authorization: Bearer <PRIVATE_CACHE_INVALIDATION_WEBHOOK_SECRET>` from `$env/dynamic/private`
   - Read tags from `body?.entity?.attributes?.tags`
   - Call CDN purge API (commented examples)

### Astro

1. **Create `executeQueryWithCacheTags`** at `src/lib/datocms/executeQuery.ts`:
   - Accept query and optional `{ variables, includeDrafts }`
   - Call `rawExecuteQuery` with `returnCacheTags: true`
   - Read `x-cache-tags` header
   - Return `{ data, cacheTags }`
   - Import tokens from `astro:env/server`

2. **Create usage pattern** — Show using in `.astro` page (SSR mode), setting `Astro.response.headers.set('Cache-Tag', cacheTags)` (or `Surrogate-Key` / `CDN-Tag`)

3. **Create webhook handler** at `src/pages/api/invalidate-cache.ts`:
   - Export `POST` as `APIRoute`
   - Validate `Authorization: Bearer <CACHE_INVALIDATION_WEBHOOK_SECRET>` from `astro:env/server`
   - Read tags from `body?.entity?.attributes?.tags`
   - Call CDN purge API (commented examples)

4. **Add env schema** in `astro.config.mjs` (or `.ts`) under `env.schema`:
   ```js
   CACHE_INVALIDATION_WEBHOOK_SECRET: envField.string({
     context: 'server',
     access: 'secret',
   }),
   // CDN-specific (uncomment for your CDN):
   // FASTLY_SERVICE_ID: envField.string({ context: 'server', access: 'secret' }),
   // FASTLY_KEY: envField.string({ context: 'server', access: 'secret' }),
   ```

### Mandatory rules for all generated code

**Security:**

- Secrets from env vars only
- Validate webhook secret
- Return 401 for invalid secrets

**TypeScript:** Follow `../../../patterns/MANDATORY_RULES.md`

**Env var naming:** Follow `../../../patterns/MANDATORY_RULES.md`

Recipe-specific names:

- Next.js: `CACHE_INVALIDATION_WEBHOOK_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- Nuxt: `NUXT_CACHE_INVALIDATION_WEBHOOK_SECRET`, `NUXT_FASTLY_SERVICE_ID`
- SvelteKit: `PRIVATE_CACHE_INVALIDATION_WEBHOOK_SECRET`, `PRIVATE_FASTLY_SERVICE_ID`
- Astro: `CACHE_INVALIDATION_WEBHOOK_SECRET`, `FASTLY_SERVICE_ID`

**File conflicts:** Follow `../../../patterns/MANDATORY_RULES.md`

**Output status:**

- `scaffolded` if database is `Other`, CDN is `Other`, or placeholder adapter logic remains
- `production-ready` only when concrete database/CDN strategy and no placeholder logic

## Step 5: Install Dependencies

| Package | When |
| - | - |
| `@libsql/client` | Next.js with Turso |
| `@vercel/postgres` | Next.js with Vercel Postgres |

Nuxt/SvelteKit/Astro: no additional deps — `rawExecuteQuery` from `@datocms/cda-client`.

Use project's package manager (see `../../../patterns/MANDATORY_RULES.md`).

## Step 6: Environment Variables

Add to `.env.example` (create if needed) and `.env.local` (or `.env`). Only add missing vars; preserve existing.

**Next.js:**

```
CACHE_INVALIDATION_WEBHOOK_SECRET=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

**Nuxt:**

```
NUXT_CACHE_INVALIDATION_WEBHOOK_SECRET=
# NUXT_FASTLY_SERVICE_ID=
# NUXT_FASTLY_KEY=
```

**SvelteKit:**

```
PRIVATE_CACHE_INVALIDATION_WEBHOOK_SECRET=
# PRIVATE_FASTLY_SERVICE_ID=
# PRIVATE_FASTLY_KEY=
```

**Astro:**

```
CACHE_INVALIDATION_WEBHOOK_SECRET=
# FASTLY_SERVICE_ID=
# FASTLY_KEY=
```

## Step 7: Next Steps

1. **Create webhook in DatoCMS** — Project Settings → Webhooks → Create:
   - **Name:** "Cache Tags Invalidation"
   - **Event type:** "Content Delivery API Cache Tags" → "Invalidate"
   - **URL:**
     - Next.js: `https://your-site.com/api/revalidate`
     - Nuxt/SvelteKit/Astro: `https://your-site.com/api/invalidate-cache`
   - **Secret token:** Must match `CACHE_INVALIDATION_WEBHOOK_SECRET` env var
   - **Payload:** `{ entity: { attributes: { tags: ["tag1", "tag2", ...] } } }`

2. **Usage example:**
   - **Next.js:** Use `executeQuery` with `queryId` (e.g., `queryId: 'blog-post-${slug}'`). Add `export const dynamic = 'force-static'` on pages. `queryId` should be stable and unique per query+variables.
   - **Nuxt:** Use `fetchWithCacheTags` in server routes, set header via `setResponseHeader(event, 'Cache-Tag', cacheTags)`
   - **SvelteKit:** Use in load functions, call `event.setHeaders({ 'Cache-Tag': cacheTags })`
   - **Astro:** Use in `.astro` pages, set `Astro.response.headers.set('Cache-Tag', cacheTags)`. SSR mode required.

3. **If `scaffolded`:** list exact missing database/CDN/purge-adapter work for production-ready.

4. **Testing:** Deploy site, make content change in DatoCMS, verify only affected pages purged (check CDN logs or response headers).

Follow `../../../patterns/OUTPUT_STATUS.md` for final handoff, including explicit `Unresolved placeholders` section.

## Verification Checklist

### Base scaffold checks

1. `executeQuery` uses `rawExecuteQuery` with `returnCacheTags: true`, reads `x-cache-tags` header
2. Next.js: `queryId` passed to `rawExecuteQuery`, tags stored via `cacheTagsDb.storeTags()`
3. Next.js: Webhook calls `revalidateTag(tag, { expire: 0 })` for global `'datocms'` and affected `queryId`s
4. Next.js: Pages export `dynamic = 'force-static'`
5. Nuxt/SvelteKit/Astro: Tags forwarded as CDN headers with correct name
6. Nuxt/SvelteKit/Astro: Webhook calls CDN purge API with tags
7. All webhook handlers validate secret via `Authorization: Bearer <secret>`
8. All webhook handlers read tags from `body?.entity?.attributes?.tags`
9. Nuxt: `cacheInvalidationWebhookSecret` in `runtimeConfig`
10. Astro: `CACHE_INVALIDATION_WEBHOOK_SECRET` in `env.schema` using `envField.string()`
11. Astro: User warned if output mode not `'server'` or `'hybrid'`
12. TypeScript follows mandatory rules (no `as unknown as`, inferred types, `import type`)
13. Env vars use correct framework-specific names

### Production-ready checks

1. Report `scaffolded` and list missing adapter work if placeholder remains
2. Report `production-ready` only when concrete database/CDN strategy and no placeholder logic
