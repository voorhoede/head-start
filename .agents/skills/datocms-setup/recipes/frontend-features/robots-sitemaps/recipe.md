_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `robots-sitemaps` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Robots and Sitemaps Setup

You are an expert at generating `robots.txt` and sitemap outputs for DatoCMS frontends. This recipe focuses on crawler-safe route generation, same-domain URL output, and deterministic public-route mapping.

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
2. **Public site URL config** — inspect env files for a framework-appropriate site URL
3. **Existing SEO helper** — check whether a shared `public-url` helper already exists from SEO setup
4. **Existing preview routing** — inspect any `recordToWebsiteRoute`, route-builder helpers, or other public URL mapping utilities
5. **Existing robots/sitemap routes** — search for framework-native route files
6. **Public content sections** — inspect routes and page directories for public sections such as `/blog`, `/docs`, or `/help`
7. **Search index suffix hints** — inspect existing Site Search env vars or Dato-related docs in the repo for section-specific crawler suffixes

### Stop conditions

- If the framework cannot be determined, ask the user.
- If the repo already has a materially different sitemap implementation, patch it in place by default instead of rewriting it wholesale.

## Step 2: Ask Questions

Infer first from the repo.

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you do ask, make it one concise question, put the recommended/default path first, and explain whether skipping it will leave placeholders, ownership, or project-specific values unresolved.

Only ask if the repo exposes multiple public sections but their sitemap or crawler boundaries cannot be inferred safely from the existing route structure.

## Step 3: Load References

Read only these references:

- `../../../../datocms-frontend-integrations/references/robots-and-sitemaps.md`

If the repo already has SEO or preview-route helpers, inspect those files directly and reuse them instead of loading more references than necessary.

## Step 4: Generate Code

Generate framework-native crawler outputs and one shared mapping layer.

### Required project changes

1. **Reuse or create the shared public URL helper**
   - If SEO setup already created `public-url.ts`, reuse it
   - Otherwise create the same helper shape here
2. **Create one shared sitemap mapping layer** that defines:
   - explicit public sections
   - path builders
   - `lastmod` sources
3. **Generate framework-native `robots.txt` output**
4. **Generate framework-native sitemap output**
5. **Generate a sitemap index only when more than one sitemap document is actually emitted**

### Shared mapping rules

Every discovered public model or section must have:

- one explicit URL builder
- one explicit source of `lastmod`

If either is missing, keep the result `scaffolded`.

### Public site URL env convention

Use the same env var as SEO setup:

- Next.js: `NEXT_PUBLIC_SITE_URL`
- Nuxt: `NUXT_PUBLIC_SITE_URL`
- SvelteKit: `PUBLIC_SITE_URL`
- Astro: `PUBLIC_SITE_URL`

### Mandatory crawler rules

- `Allow` directives for Dato crawler sections must appear before `Disallow: /`
- Emit a `DatoCmsSearchBot` group even when the site has only one search index
- Emit suffix-specific groups such as `DatoCmsSearchBotDocs` only when the repo already has multiple indexes or clearly separated sections
- Add `Sitemap:` directives that point to the generated sitemap entrypoint
- Only emit absolute URLs under the configured public site URL
- Keep robots and sitemap generation deterministic and free of guessed routes

### Framework-native routes

Use the framework's own route shape:

- Next.js -> metadata route helpers for robots/sitemap where possible
- Nuxt -> `server/routes`
- SvelteKit -> `+server.ts`
- Astro -> page endpoints

Reuse existing file-placement conventions in the repo.

### Output status

- Report `scaffolded` if the site URL is still a placeholder or any public section lacks a concrete route / `lastmod` mapping
- Report `production-ready` only when the generated outputs have real URLs, deterministic mappings, and no unresolved crawler TODOs

## Step 5: Next Steps

After generating the files, tell the user:

1. Which sitemap entrypoint was created
2. Which public sections were added to the sitemap source list
3. Whether suffix-specific Dato crawler groups were generated
4. Which mappings still need real route or `lastmod` logic, if any

## Verification Checklist

Before presenting the result, verify:

1. `robots.txt` contains ordered `Allow` directives before any catch-all `Disallow: /`
2. The generated sitemap contains only same-domain absolute URLs
3. A sitemap index is generated only when multiple sitemap documents exist
4. Every public section has an explicit route builder and `lastmod` source
5. The framework-native route mechanism matches the detected stack
6. The result is `scaffolded` if the site URL or route mappings remain unresolved
