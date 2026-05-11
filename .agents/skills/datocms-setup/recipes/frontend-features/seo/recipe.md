_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `seo` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS SEO Setup

You are an expert at wiring DatoCMS SEO metadata into existing frontend projects. This recipe focuses on data-layer and head-rendering integration. It does not create or edit Dato schema in v1.

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

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

1. **Framework** — detect Next.js, Nuxt, SvelteKit, or Astro
2. **Dato query layer** — inspect any shared `executeQuery` wrapper, GraphQL query files, generated GraphQL helpers, or page-level data loaders
3. **Head integration** — inspect `generateMetadata`, `useHead`, layout head components, or existing SEO utilities
4. **Installed Dato UI packages** — check for `react-datocms`, `vue-datocms`, `@datocms/svelte`, and `@datocms/astro`
5. **Public URL config** — inspect env files for a framework-appropriate public site URL
6. **Content Link state** — detect whether Content Link / stega encoding is already configured, because SEO string logic may need `stripStega()`
7. **Shared lib folder** — determine the correct place for reusable URL helpers

### Stop conditions

- If the framework cannot be determined, ask the user.
- If the repo already has a strong SEO abstraction, patch it in place by default instead of replacing it.

## Step 2: Ask Questions

Infer first from the repo.

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you do ask, make it one concise question, put the recommended/default path first, and explain whether skipping it will leave placeholders, ownership, or project-specific values unresolved.

Only ask if the project already has multiple competing metadata systems and it is unclear which one owns the final page head output.

## Step 3: Load References

Read only these references:

- `../../../../datocms-cda/references/seo-and-meta.md`
- `../../../../datocms-frontend-integrations/references/react-seo.md`
- `../../../../datocms-frontend-integrations/references/vue-seo.md`
- `../../../../datocms-frontend-integrations/references/svelte-seo.md`
- `../../../../datocms-frontend-integrations/references/astro-seo.md`

If Content Link is already configured, also load:

- `../../../../datocms-frontend-integrations/references/content-link-concepts.md`

Use only the framework-specific SEO reference that matches the project.

## Step 4: Generate Code

Generate the minimum SEO integration that makes Dato the source of truth for page metadata.

### Required project changes

1. **Patch the relevant query layer** so page data fetches:
   - `_seoMetaTags`
   - `_site.faviconMetaTags`
   - `globalSeo` when the existing query structure already reads site-level data
2. **Create or patch one shared public URL helper** with:
   - `getSiteUrl()`
   - `buildCanonicalUrl(pathname)`
3. **Patch env placeholders** for a framework-appropriate public site URL
4. **Wire metadata rendering into the framework-native head system**
   - Next.js -> `generateMetadata` with `toNextMetadata(...)`
   - Nuxt -> `useHead(toHead(...))`
   - SvelteKit -> `@datocms/svelte` `<Head />`
   - Astro -> `@datocms/astro/Seo`
5. **Preserve existing route ownership** — patch page or layout files in place instead of creating a second metadata path

### Shared helper path

Unless the repo already has a different shared Dato helper location, use:

- with `src/`: `src/lib/datocms/public-url.ts`
- without `src/`: `lib/datocms/public-url.ts`
- Nuxt: `lib/datocms/public-url.ts`

### Public site URL env convention

- Next.js: `NEXT_PUBLIC_SITE_URL`
- Nuxt: `NUXT_PUBLIC_SITE_URL`
- SvelteKit: `PUBLIC_SITE_URL`
- Astro: `PUBLIC_SITE_URL`

Only add the variable if it does not already exist.

### Mandatory rules

- Do not mutate Dato schema in this setup
- Use `_seoMetaTags` and Dato fallbacks instead of inventing manual SEO fields
- Combine page SEO tags with favicon tags before rendering them
- Canonical URLs must come from `buildCanonicalUrl()`, not string concatenation spread across pages
- If Content Link is active and metadata logic reads stega-encoded strings, use `stripStega()` before string comparisons or canonical-path construction
- Patch existing metadata systems in place instead of adding parallel head logic

### Output status

- Report `scaffolded` if the public site URL is still a placeholder or if the query integration remains partially wired
- Report `production-ready` only when page SEO tags, favicon tags, and canonical URL helpers are all fully wired with real env values

## Step 5: Next Steps

After generating the files, tell the user:

1. Which queries now fetch `_seoMetaTags` and favicon tags
2. Which public site URL env var must be filled, if still pending
3. Whether Content Link stripping was necessary in SEO-related code paths
4. That this setup intentionally did not change Dato schema

## Verification Checklist

Before presenting the result, verify:

1. The project fetches `_seoMetaTags`
2. The project fetches `_site.faviconMetaTags`
3. Canonical URLs come from the shared `buildCanonicalUrl()` helper
4. The framework-specific metadata renderer is correct for the detected stack
5. The public site URL uses the framework's public env convention
6. Content Link / stega strings are stripped before SEO string logic when needed
7. The result is `scaffolded` if the site URL or query wiring remains placeholder-driven
