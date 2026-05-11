_Internal recipe for `datocms-setup`. Use after parent skill selects `content-link` recipe and queues prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Content Link Setup

Expert at setting up DatoCMS Content Link — click-to-edit overlays for editors to jump from draft site to DatoCMS fields.

Follow steps in order. Do not skip.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Modify executeQuery
- Step 5: Generate or Patch Content Link shell
- Step 6: Patch Structured Text/non-text edit targets when they exist
- Step 7: Add CSP header
- Step 8: Install dependencies
- Step 9: Environment variables
- Step 10: Final handoff
- Mandatory rules for all generated code
- Verification checklist

## Step 1: Detect Context (silent)

Silently examine project:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals.

1. **Framework/file layout** — use `../../../references/repo-conventions.md` for framework detection, `src/` usage, and standard layout/route locations.

2. **Prerequisite: Draft mode** — Check draft mode enable endpoint exists:
   - Next.js: `src/app/api/draft-mode/enable/route.ts` or `app/api/draft-mode/enable/route.ts`
   - Nuxt: `server/api/draft-mode/enable.ts`
   - SvelteKit: `src/routes/api/draft-mode/enable/+server.ts`
   - Astro: `src/pages/api/draft-mode/enable/index.ts` or `src/pages/api/draft-mode/enable.ts`

3. **Existing executeQuery wrapper** — Find shared `executeQuery`. Check if it passes `contentLink` and `baseEditingUrl` options.

4. **Root layout file** — Find root layout:
   - Next.js: `src/app/layout.tsx` or `app/layout.tsx`
   - Nuxt: `app.vue` or `layouts/default.vue`
   - SvelteKit: `src/routes/+layout.svelte`
   - Astro: `src/layouts/Layout.astro` or similar

5. **Existing preview/editor wiring** — Inspect for:
   - Web Previews endpoints/helpers
   - real-time preview wiring
   - existing visual-editing/stega helpers

6. **Vercel conflict signals** — Look for Vercel Content Link / Edit Mode:
   - `@vercel/stega`, `@vercel/toolbar`, or related
   - Vercel preview-specific visual-editing headers
   - `data-vercel-edit-target` usage
   - existing Edit Mode helpers

7. **Structured Text renderers** — Check if repo renders Structured Text with `react-datocms`, `vue-datocms`, `@datocms/svelte`, or `@datocms/astro`.

8. **Non-text Dato field rendering** — Check if repo renders Dato-backed numbers, booleans, dates, or JSON values needing explicit edit URLs.

9. **Existing CSP config** — Check if `frame-ancestors` CSP configured.

10. **Installed deps** — Check `package.json` for: `@datocms/content-link`, `react-datocms`, `vue-datocms`, `@datocms/svelte`, `@datocms/astro`.

### Stop conditions

- No draft mode: record `draft-mode` as prerequisite, continue after applied. Do NOT tell user to run recipe manually.
- `executeQuery` already has `contentLink: 'v1'` and `baseEditingUrl`: inspect existing setup, update in place by default.
- Repo has Vercel overlay wiring: do NOT layer Dato overlays without resolving conflict first.

## Step 2: Ask Questions

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Only ask if high-impact ambiguities remain after inspection:

1. **Vercel conflict** — Repo uses Vercel Content Link / Edit Mode and recipe selected directly rather than through visual-editing bundle.

   Ask:

   > "This repo already appears to use Vercel Content Link / Edit Mode. Do you want me to preserve that setup, replace it with DatoCMS Content Link, or switch to the full DatoCMS visual-editing workflow with Web Previews? Recommended default: preserve the existing Vercel setup unless you explicitly want DatoCMS side-by-side editing. If you skip, I'll preserve the existing Vercel overlays and avoid duplicate overlays."

2. **Renderer ownership** — Multiple competing layout/Content Link mounting points exist, unclear which owns production preview shell.

   Ask:

   > "This repo already has more than one possible preview shell. Which layout or wrapper should own the Content Link mount? Recommended default: preserve the most central draft-aware shell already used by the preview flow. If you skip, I'll patch that strongest existing owner and list alternative shells under unresolved placeholders."

Proceed directly if neither applies.

## Step 3: Load References

Read relevant reference files. Load only what needed.

**Always load:**

- `../../../../datocms-frontend-integrations/references/visual-editing-concepts.md`
- `../../../../datocms-frontend-integrations/references/content-link-concepts.md`

**Load per framework — focus on `## Content Link (Optional)` section:**

| Framework | Reference file |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro.md` |

**Load framework-appropriate component reference:**

| Framework | Component reference |
| - | - |
| Next.js (React) | `../../../../datocms-frontend-integrations/references/react-content-link.md` |
| Nuxt (Vue) | `../../../../datocms-frontend-integrations/references/vue-content-link.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/svelte-content-link.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro-content-link.md` |

## Step 4: Modify executeQuery

Modify existing `executeQuery` wrapper to add DatoCMS Content Link support when in draft mode:

- Add `contentLink: 'v1'` to query options when `includeDrafts` is true
- Add `baseEditingUrl` (from env vars) to query options when `includeDrafts` is true
- Preserve existing draft-mode/preview-specific options instead of rewriting
- If repo uses Vercel visual-editing headers, do NOT keep both systems active

**Environment variable for `baseEditingUrl`:**

- Next.js: `DATOCMS_BASE_EDITING_URL`
- Nuxt: `NUXT_PUBLIC_DATOCMS_BASE_EDITING_URL`
- SvelteKit: `PRIVATE_DATOCMS_BASE_EDITING_URL`
- Astro: `DATOCMS_BASE_EDITING_URL`

Read existing `executeQuery` file first, then make targeted modifications.

## Step 5: Generate or Patch Content Link shell

Generate/patch Content Link component with framework-specific router integration:

### Next.js (React)

- Create/patch `ContentLink` client component wrapping DatoCMS implementation
- Wire `onNavigateTo` to Next.js `router.push()`
- Wire `currentPath` to `usePathname()`
- Prefer touch-safe default like `enableClickToEdit={{ hoverOnly: true }}` unless repo uses different convention

### Nuxt (Vue)

- Create/patch `ContentLink` component using `vue-datocms`
- Wire `on-navigate-to` to `navigateTo()`
- Wire `current-path` to `useRoute().path`

### SvelteKit

- Create/patch `ContentLink` component using `@datocms/svelte`
- Wire `onNavigateTo` to `goto`
- Wire `currentPath` to `$page.url.pathname`

### Astro

- Use `<ContentLink />` from `@datocms/astro/ContentLink`
- Keep Astro API limited to documented props
- Do NOT add React-style router props

### Root layout placement

- Add `<ContentLink />` to root layout only when draft mode active
- Reuse existing preview shell if one exists

## Step 6: Patch Structured Text/non-text edit targets when they exist

When repo renders Structured Text, patch existing renderer:

- wrap main Structured Text container with `data-datocms-content-link-group`
- add `data-datocms-content-link-boundary` around embedded blocks/inline records so they open own editor instead of bubbling to parent
- reuse existing renderer/component structure

When repo renders non-text Dato-backed values and current query/data flow can safely support:

- prefer explicit edit URLs based on `_editingUrl`
- attach edit URLs to existing rendered element instead of introducing decorative wrappers
- only expand GraphQL/query shape when repo clearly has stable place to consume `_editingUrl`

Do NOT fabricate new query surfaces to demonstrate pattern.

## Step 7: Add CSP header

If not configured, add CSP header:

```text
frame-ancestors 'self' https://plugins-cdn.datocms.com
```

Required for DatoCMS Web Previews / side-by-side visual editing.

## Step 8: Install dependencies

Install missing packages:

| Package | When |
| - | - |
| `@datocms/content-link` | Always (if not installed) |

Framework-specific component library (`react-datocms`, `vue-datocms`, `@datocms/svelte`, `@datocms/astro`) should already be installed or will be installed here if missing.

Use project's package manager (see `../../../patterns/MANDATORY_RULES.md`).

## Step 9: Environment variables

Add base editing URL placeholder to env files when missing:

- Next.js: `DATOCMS_BASE_EDITING_URL=https://your-project.admin.datocms.com/environments/main`
- Nuxt: `NUXT_PUBLIC_DATOCMS_BASE_EDITING_URL=https://your-project.admin.datocms.com/environments/main`
- SvelteKit: `PRIVATE_DATOCMS_BASE_EDITING_URL=https://your-project.admin.datocms.com/environments/main`
- Astro: `DATOCMS_BASE_EDITING_URL=https://your-project.admin.datocms.com/environments/main`

Only add variables that do NOT already exist.

## Step 10: Final handoff

After generating files, tell user:

1. base editing URL that still needs real value, if any
2. whether Structured Text/non-text edit-target patches applied
3. whether repo kept existing Vercel overlay flow or switched fully to DatoCMS Content Link
4. optional follow-up recipe ids that still make sense: `web-previews`, `realtime`, or `visual-editing`

Follow shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including explicit `Unresolved placeholders` section.

## Mandatory rules for all generated code

### TypeScript

Follow TypeScript rules in `../../../patterns/MANDATORY_RULES.md`.

### File conflicts

Follow file conflict rules in `../../../patterns/MANDATORY_RULES.md`.

### Overlay exclusivity

Never enable DatoCMS Content Link and Vercel Content Link overlays simultaneously.

## Verification checklist

Before presenting final code, verify:

1. `executeQuery` has `contentLink: 'v1'` and `baseEditingUrl` when `includeDrafts` is true
2. Content Link component created/patched with correct framework-specific router integration
3. `<ContentLink />` added to root layout only when draft mode active
4. CSP `frame-ancestors 'self' https://plugins-cdn.datocms.com` configured when needed
5. Structured Text renderers patched with group/boundary handling when they exist in repo
6. non-text edit URLs use `_editingUrl` only when repo has safe place to consume them
7. Dato overlays and Vercel overlays never left active simultaneously
8. final handoff includes explicit `Unresolved placeholders` section
