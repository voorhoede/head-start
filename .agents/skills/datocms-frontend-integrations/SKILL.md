---
name: datocms-frontend-integrations
description: >-
  Patch, extend, or explain DatoCMS front-end integration code in an existing
  web project (Next.js App Router, Nuxt, SvelteKit, Astro, plus
  React/Vue/Svelte component usage). Use for targeted, per-concern work —
  adding a draft mode endpoint, wiring Preview Links / Visual Editing flows,
  fixing Content Link overlays, tuning real-time preview subscriptions,
  setting up cache-tag invalidation/revalidation (Next.js revalidateTag or
  CDN purge by tags), adding robots/sitemap wiring, hooking up crawler-safe
  search. Also the go-to skill for framework component/hook wiring with
  react-datocms, vue-datocms, @datocms/svelte, @datocms/astro:
  Image/SRCImage/datocms-image, StructuredText, VideoPlayer (React/Vue/Svelte),
  SEO/meta helpers (renderMetaTags/toHead/Seo), QuerySubscription/QueryListener
  realtime, ContentLink components, Site Search (React/Vue). Prefer when
  modifying a live codebase one concern at a time, asking a framework-specific
  API question, or mixing several front-end concerns in the same patch.
---

# DatoCMS Front-End Integrations Skill

Shared front-end integration bundle. Prefer `datocms-setup` for single feature end-to-end. Stay here for mixed-feature, framework comparison, partial patching, companion-reference loading.

Report `scaffolded` when placeholders remain, `production-ready` only when implementation no longer depends on unresolved project-specific values.

## Contents

- [Step 1: Detect Context](#step-1-detect-context-silent)
- [Step 2: Classify and Route](#step-2-classify-and-route)
- [Step 3: Load References](#step-3-load-references)
- [Step 4: Generate or Patch Code](#step-4-generate-or-patch-code)
- [Step 5: Verify](#step-5-verify)
- [Cross-Skill Routing](#cross-skill-routing)

## Step 1: Detect Context (silent)

Skip if context established. Only re-inspect when question can't be answered from prior context.

Silently examine:

1. **Framework** — `package.json`: `next` → Next.js App Router, `nuxt` → Nuxt, `@sveltejs/kit` → SvelteKit, `astro` → Astro, `@remix-run/` → Remix, or infer React/Vue/other
2. **UI stack** — Dato rendering lib: React (`react-datocms`), Vue (`vue-datocms`), SvelteKit/Svelte (`@datocms/svelte`), Astro without React (`@datocms/astro`)
3. **Existing Dato helpers** — `@datocms/cda-client`, query wrappers, image/Structured Text helpers, env vars
4. **Existing integration markers** — draft mode endpoints, preview-links, Content Link, real-time subscriptions, cache-tag forwarding, search routes, robots/sitemap
5. **File structure** — `src/` or root-level app directories
6. **Starter-conventions markers** (gql.tada projects) — `gql.tada` in `package.json`, `lib/datocms/gqlUrlBuilder/` folder, project `<Text>` wrapper around `<StructuredText />`, co-located `fragments.ts` next to block / inline-record / link-to-record components. Presence of these = project follows the patterns in `references/url-builders.md` + `datocms-cda/references/fragment-patterns.md`.

### Stop conditions

- Framework unclear → ask user
- Integration exists → inspect and patch in place by default
- Only ask about full replacement when clearly incompatible, broken, or user explicitly requested rewrite

## Step 2: Classify and Route

Categorize into:

| Category | When to select |
| - | - |
| **Draft Mode Setup** | Draft cookies, enable/disable endpoints, or draft CDA token switching |
| **Web Previews Setup** | Preview-links endpoints, route mapping, Visual tab support |
| **Responsive Images** | Dato image rendering helpers or component selection |
| **Structured Text Rendering** | Structured Text query shapes or renderer wiring |
| **Video Player** | Dato / Mux video playback integration |
| **SEO & Meta Tags** | `_seoMetaTags`, favicon tags, canonical wiring |
| **Real-Time Updates** | Live preview subscriptions or `<QueryListener />` wiring |
| **Visual Editing / Content Link** | Click-to-edit overlays and stega-aware rendering |
| **Site Search** | React / Vue widgets or low-level Search API wiring |
| **Robots & Sitemaps** | `robots.txt`, sitemap routes, crawler-safe rules |
| **Cache Tags** | Granular invalidation or tag-forwarding patterns |

Multiple categories can apply.

### Prefer the setup orchestrator for full single-feature scaffolding

Route to `datocms-setup` instead of keeping all work in this bundle:

| Category | Route |
| - | - |
| Draft Mode Setup | `datocms-setup` for `draft-mode` |
| Web Previews Setup | `datocms-setup` for `web-previews` |
| Responsive Images | `datocms-setup` for `responsive-images` |
| Structured Text Rendering | `datocms-setup` for `structured-text` |
| Video Player | `datocms-setup` for `video-player` |
| SEO & Meta Tags | `datocms-setup` for `seo` |
| Real-Time Updates | `datocms-setup` for `realtime` |
| Visual Editing / Content Link | `datocms-setup` for `visual-editing` (full flow) or `content-link` (overlays/stega only) |
| Site Search | `datocms-setup` for `site-search` |
| Robots & Sitemaps | `datocms-setup` for `robots-sitemaps` |
| Cache Tags | `datocms-setup` for `cache-tags` |

Route to `datocms-setup` for "set up X end-to-end from scratch" (single feature). Stay here for multi-feature, partial patching, framework comparisons, or when another skill explicitly depends on these references.

**visual editing** = full editorial flow (draft mode + preview links + Content Link + real-time). Route to `content-link` only when user explicitly wants overlay/stega in isolation.

### Questions

Ask zero questions by default.

Only ask when blocked by something the repo cannot answer:

- missing model-to-route mappings for preview/sitemap
- missing cache provider or purge-adapter choice
- multiple competing renderers where patching the wrong one is risky

Otherwise proceed and call out unresolved values instead of stalling.

## Step 3: Load References

Read only what is needed from `references/` next to this skill. Long files include contents section at top; preview that first, then load relevant section.

### Component concept references

Load concept file first (shared GraphQL queries, field definitions, patterns), then framework-specific file for component APIs/props.

| Category | Concept file |
| - | - |
| Responsive Images | `references/image-concepts.md` |
| Video Player | `references/video-player-concepts.md` |
| SEO & Meta Tags | `references/seo-concepts.md` |
| Real-Time Updates | `references/realtime-concepts.md` |
| Site Search | `references/site-search-concepts.md` |

### Setup foundations

Load these for mixed-feature setup work:

- `references/draft-mode-concepts.md`
- one framework reference:
  - `references/nextjs.md`
  - `references/nuxt.md`
  - `references/sveltekit.md`
  - `references/astro.md`
  - `references/remix.md`
- optional concept references:
  - `references/web-previews-concepts.md`
  - `references/content-link-concepts.md`
  - `references/realtime-concepts.md`

### React references

| Category | Reference file |
| - | - |
| Responsive Images | `references/react-image.md` |
| Structured Text Rendering | `references/react-structured-text.md` |
| Video Player | `references/react-video-player.md` |
| SEO & Meta Tags | `references/react-seo.md` |
| Real-Time Updates | `references/react-realtime.md` |
| Visual Editing / Content Link | `references/react-content-link.md` |
| Site Search | `references/react-site-search.md` |

### Vue references

| Category | Reference file |
| - | - |
| Responsive Images | `references/vue-image.md` |
| Structured Text Rendering | `references/vue-structured-text.md` |
| Video Player | `references/vue-video-player.md` |
| SEO & Meta Tags | `references/vue-seo.md` |
| Real-Time Updates | `references/vue-realtime.md` |
| Visual Editing / Content Link | `references/vue-content-link.md` |
| Site Search | `references/vue-site-search.md` |

### Svelte references

| Category | Reference file |
| - | - |
| Responsive Images | `references/svelte-image.md` |
| Structured Text Rendering | `references/svelte-structured-text.md` |
| Video Player | `references/svelte-video-player.md` |
| SEO & Meta Tags | `references/svelte-seo.md` |
| Real-Time Updates | `references/svelte-realtime.md` |
| Visual Editing / Content Link | `references/svelte-content-link.md` |

Use `references/site-search-api.md` for Svelte / SvelteKit site-search work.

### Astro references

| Category | Reference file |
| - | - |
| Responsive Images | `references/astro-image.md` |
| Structured Text Rendering | `references/astro-structured-text.md` |
| SEO & Meta Tags | `references/astro-seo.md` |
| Real-Time Updates | `references/astro-realtime.md` |
| Visual Editing / Content Link | `references/astro-content-link.md` |

Use `references/site-search-api.md` for Astro site-search work. For Astro video, use Mux web component directly or React integration when project already has it.

### gql.tada starter-conventions references

Load when project uses `gql.tada` AND task adds/extends a block, inline-record, link-to-record, routable model, or page query:

- `references/url-builders.md` — per-model URL builders + `buildUrlFromGql()` dispatcher
- `../datocms-cda/references/fragment-patterns.md` — masking discipline, `readFragment()` boundary, fragment composition, page-query rule

Don't load when project uses plain `executeQuery` strings or codegen with hand-shaped types — patterns don't apply.

### Generic search and crawl references

Load for framework-agnostic, non-widget-based, or crawler-specific:

- `references/site-search-api.md`
- `references/robots-and-sitemaps.md`

### Verification reference

When implementation work is involved, load:

- `references/verification-checklists.md`

## Step 4: Generate or Patch Code

Follow loaded references and shared rules:

### Workflow rules

- Respect existing abstractions and patch in place by default
- Prefer focused setup skill when task narrows to single full scaffold
- Make targeted changes instead of full rewrites unless current code is unusable

### Security and environment rules

- All secrets from environment variables
- Validate dedicated preview/webhook secret env var where draft mode or preview-links flows require it; preserve existing repo naming when present
- Use `isRelativeUrl()` for redirect validation
- Do not require authentication on draft-mode disable endpoints

### Query-wrapper rules

- Add or preserve `includeDrafts` option for draft-aware querying
- Switch between published and draft CDA tokens based on that option
- Default to `excludeInvalid: true` for draft-aware wrapper patterns unless task explicitly needs invalid records during schema work
- Enable repo's existing `contentLink` mode (`'v1'` or `'vercel-v1'`) plus `baseEditingUrl` only in draft / visual-editing contexts

### Framework rules

- Use native env and redirect APIs for detected framework
- For Astro, always use `@datocms/astro/*` subpath imports
- Use framework-appropriate component or helper API from loaded reference, not cross-framework pattern from memory

### TypeScript rules

- No `as unknown as`
- Avoid unnecessary casts
- Prefer `import type { ... }` for type-only imports
- Let TypeScript infer where it can

### Dependency rules

- Install missing packages only when task truly needs them
- Use `@mux/mux-player-react` for React video
- Use `@mux/mux-player` for Vue or Svelte video
- Use `@datocms/cma-client-browser` for React / Vue widget-based site search

### Search and crawl safety rules

- Use explicit search index ids
- Use least-privilege public search tokens in browser
- Keep sitemap output on configured public domain only
- Order Dato crawler `Allow` rules before any catch-all `Disallow: /`

If customer-specific values (route mappings, provider details, index ids) remain unresolved, leave clear placeholders and explicitly call out missing inputs instead of presenting work as fully ready.

## Step 5: Verify

Load `references/verification-checklists.md` and check only sections relevant to work you actually performed.

At minimum, verify:

- security, token handling, redirect validation, environment-variable usage
- query shapes, wrapper options, framework-specific component APIs
- dependency choices and import paths
- draft-only behavior stays draft-only
- any remaining placeholders or customer-specific mappings are clearly called out

## Cross-Skill Routing

Use companion skills when task leaves this bundle's sweet spot:

| Condition | Route to |
| - | - |
| Full single-feature scaffolding | `datocms-setup` with matching recipe from Step 2 |
| Shared CDA client wrapper or `executeQuery` baseline | `datocms-setup` for `cda-client` |
| Writing or optimizing GraphQL queries for the CDA | `datocms-cda` |
| gql.tada fragment-writing discipline (masking, composition, page query) | `datocms-cda` (`../datocms-cda/references/fragment-patterns.md`) |
| Programmatic content management, schema changes, migration scripts, access control, or webhook creation via REST | `datocms-cma` |
| Building a DatoCMS plugin | `datocms-plugin-builder` |
