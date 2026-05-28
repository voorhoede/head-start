_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `draft-mode` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Draft Mode Setup

You are an expert at setting up DatoCMS draft mode for frontend frameworks. This recipe generates all files needed for draft mode: enable/disable endpoints, utilities, and an `executeQuery` wrapper with dual-token switching.

Follow these steps in order. Do not skip steps.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Install Dependencies
- Step 6: Environment Variables
- Step 7: Final handoff
- Verification Checklist

## Step 1: Detect Context (silent)

Silently examine the project:

Follow the shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect the recipe-specific signals below.

1. **Framework and file layout** — use `../../../references/repo-conventions.md` for supported framework detection, `src/` usage, and the standard draft-mode route locations.

2. **Existing draft mode** — Check if draft endpoints already exist:
   - Next.js: `src/app/api/draft-mode/enable/route.ts` or `app/api/draft-mode/enable/route.ts`
   - Nuxt: `server/api/draft-mode/enable.ts`
   - SvelteKit: `src/routes/api/draft-mode/enable/+server.ts`
   - Astro: `src/pages/api/draft-mode/enable/index.ts` or `src/pages/api/draft-mode/enable.ts`

3. **Existing executeQuery wrapper** — Search for an existing `executeQuery` function that wraps `@datocms/cda-client`

4. **Installed deps** — Check `package.json` for: `@datocms/cda-client`, `serialize-error`, `jose`

5. **Env files** — Check `.env`, `.env.local`, `.env.example` for existing DatoCMS tokens

### Stop conditions

- If the framework cannot be determined, ask the user.
- If draft endpoints already exist, inspect the current implementation first and update it in place by default. Only ask about full replacement if the existing setup is materially different, clearly broken, or the user requested a clean rewrite.

## Step 2: Ask Questions

Infer first from the repo.

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Only ask if inspecting an existing draft-mode setup leaves one high-impact ambiguity around which existing endpoint, cookie helper, or shared query wrapper should remain the source of truth.

If you do ask, make it one concise question, put the recommended/default path first, and explain what happens if the user skips it. Recommended default: preserve the most central working draft-aware wrapper or endpoint already used by the live preview flow. If the user skips, patch that strongest existing owner in place and list any alternative owners under `Unresolved placeholders`.

## Step 3: Load References

Read the relevant reference files. Load only what is needed.

**Always load:**

- `../../../../datocms-frontend-integrations/references/draft-mode-concepts.md`

**Load per framework — focus on the `## Core` section:**

| Framework | Reference file |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro.md` |

## Step 4: Generate Code

Create all files following the patterns in the loaded references. Generate:

### Files to generate

1. **Enable endpoint** — Validates `SECRET_API_TOKEN`, sets draft mode cookie, redirects to the requested page
2. **Disable endpoint** — Removes draft mode cookie (no auth required), redirects back
3. **Utilities** — CORS headers helper, generic error handling using `serialize-error`, and `isRelativeUrl()` for redirect validation
4. **executeQuery wrapper** — Wraps `@datocms/cda-client` with:
   - `includeDrafts` option that switches between published and draft CDA tokens
   - `excludeInvalid: true` always set
   - Dual-token architecture (published token for production, draft token for preview)

### Mandatory rules for all generated code

#### Security

- All secrets come from environment variables — never hardcode them
- Validate the `SECRET_API_TOKEN` query parameter on the enable endpoint
- No authentication required on the disable endpoint
- Use `isRelativeUrl()` to validate redirect URLs and prevent open redirect vulnerabilities

#### Cookie Attributes

- `partitioned: true` — Required for CHIPS (third-party cookie partitioning)
- `sameSite: 'none'` — Required because DatoCMS loads the preview in an iframe
- `secure: true` — Required when `sameSite` is `'none'`

#### Framework-Specific Patterns

- Use the framework's native env access pattern:
  - Next.js: `process.env`
  - Nuxt: `useRuntimeConfig()`
  - SvelteKit: `$env/dynamic/private`
  - Astro: `astro:env/server`
- Use the framework's native redirect and response mechanisms
- Non-Next.js frameworks: use `jose` for JWT signing/verification of the draft mode cookie

#### TypeScript

Follow the TypeScript rules in `../../../patterns/MANDATORY_RULES.md`.

#### Env var naming conventions

Follow the env conventions in `../../../patterns/MANDATORY_RULES.md`.

Recipe-specific env var names:

- Next.js: `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN`, `DATOCMS_DRAFT_CONTENT_CDA_TOKEN`, `SECRET_API_TOKEN`, `DRAFT_MODE_SECRET`
- Nuxt: `NUXT_DATOCMS_DRAFT_CONTENT_CDA_TOKEN`, `NUXT_SECRET_API_TOKEN`
- SvelteKit: `PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN`, `PRIVATE_SECRET_API_TOKEN`
- Astro: `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN`, `DATOCMS_DRAFT_CONTENT_CDA_TOKEN`, `SECRET_API_TOKEN`, `DRAFT_MODE_SECRET`

#### File conflicts

Follow the file conflict rules in `../../../patterns/MANDATORY_RULES.md`.

## Step 5: Install Dependencies

Install missing packages:

| Package | When |
| - | - |
| `@datocms/cda-client` | Always (if not already installed) |
| `serialize-error` | Always (if not already installed) |
| `jose` | Non-Next.js frameworks only (for JWT signing) |

Use the project's package manager (see `../../../patterns/MANDATORY_RULES.md`).

## Step 6: Environment Variables

Add placeholder values to `.env.example` (create if it doesn't exist) and `.env.local` (or `.env` depending on framework convention):

### Next.js

```
DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN=your_published_token_here
DATOCMS_DRAFT_CONTENT_CDA_TOKEN=your_draft_token_here
SECRET_API_TOKEN=your_secret_webhook_token_here
DRAFT_MODE_SECRET=run_openssl_rand_hex_32
```

### Nuxt

```
NUXT_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN=your_published_token_here
NUXT_DATOCMS_DRAFT_CONTENT_CDA_TOKEN=your_draft_token_here
NUXT_SECRET_API_TOKEN=your_secret_webhook_token_here
NUXT_DRAFT_MODE_SECRET=run_openssl_rand_hex_32
```

### SvelteKit

```
PRIVATE_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN=your_published_token_here
PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN=your_draft_token_here
PRIVATE_SECRET_API_TOKEN=your_secret_webhook_token_here
PRIVATE_DRAFT_MODE_SECRET=run_openssl_rand_hex_32
```

### Astro

```
DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN=your_published_token_here
DATOCMS_DRAFT_CONTENT_CDA_TOKEN=your_draft_token_here
SECRET_API_TOKEN=your_secret_webhook_token_here
DRAFT_MODE_SECRET=run_openssl_rand_hex_32
```

Only add variables that don't already exist. Preserve any existing values.

## Step 7: Final handoff

After generating all files, tell the user:

1. which draft-mode files were created or reused
2. which env vars still need real values, if any
3. whether the result is `scaffolded` or `production-ready`
4. the optional follow-up recipe ids that still make sense:
   - `visual-editing` when they want the full editorial preview stack
   - `web-previews` for preview links and the Visual tab
   - `content-link` for click-to-edit overlays
   - `realtime` for live draft-session updates

Treat the result as `scaffolded` if any token or secret still uses placeholders or if wrapper ownership stayed ambiguous. Report `production-ready` only when the generated or patched draft-mode flow uses intentional repo values and no ownership ambiguity remains.

Follow the shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including an explicit `Unresolved placeholders` section.

## Verification Checklist

Before presenting the final code, verify:

1. Enable endpoint validates `SECRET_API_TOKEN`
2. Enable and disable endpoints validate redirect URLs with `isRelativeUrl()`
3. Cookies have `partitioned: true`, `sameSite: 'none'`, `secure: true`
4. `executeQuery` supports `includeDrafts` with token switching
5. Non-Next.js frameworks use JWT for the draft mode cookie
6. All secrets come from environment variables
7. Disable endpoint does NOT require authentication
8. All generated TypeScript follows the mandatory rules (no `as unknown as`, inferred types, `import type`)
