Internal recipe for `datocms-setup`. Use after parent skill selects `realtime` recipe and queues prerequisites from `../../../references/recipe-manifest.json`.

# DatoCMS Real-Time Updates Setup

Setup DatoCMS real-time updates. Generate components for live content streaming in draft mode.

Follow steps in order.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Install Dependencies
- Step 6: Final handoff
- Verification Checklist

## Step 1: Detect Context (silent)

Examine project:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals below.

1. **Framework** — Read `package.json` and check for:
   - `next` → Next.js (App Router)
   - `nuxt` → Nuxt
   - `@sveltejs/kit` → SvelteKit
   - `astro` → Astro
   - If none match, stop and ask the user which framework they are using.

2. **Prerequisite: Draft mode** — Check if the draft mode enable endpoint exists:
   - Next.js: `src/app/api/draft-mode/enable/route.ts` or `app/api/draft-mode/enable/route.ts`
   - Nuxt: `server/api/draft-mode/enable.ts`
   - SvelteKit: `src/routes/api/draft-mode/enable/+server.ts`
   - Astro: `src/pages/api/draft-mode/enable/index.ts` or `src/pages/api/draft-mode/enable.ts`

3. **Content Link setup** — Check if Content Link is configured (look for `contentLink: 'v1'` in the `executeQuery` wrapper). If Content Link is set up, the real-time subscription options should include `contentLink` and `baseEditingUrl` as well.

4. **Existing realtime utilities** — Check for existing subscription components or patterns

5. **Installed deps** — Check `package.json` for: `react-datocms`, `vue-datocms`, `@datocms/svelte`, `@datocms/astro`

### Stop conditions

- If draft mode does not exist, record `draft-mode` as a prerequisite and continue after it is applied.
- If realtime components already exist, inspect them first and update them in place by default. Only ask about full replacement if the current implementation is materially incompatible or the user explicitly wants a rewrite.

## Step 2: Ask Questions

Infer first from the repo.

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Only ask if one of these high-impact ambiguities remains after inspection:

1. **Realtime bundle inclusion** — the user asked for a broad visual-editing workflow, but it is still unclear whether realtime should be part of the active bundle.

   Ask one question:

   > "Do you also want real-time updates while editors type? Recommended default: no unless you explicitly asked for live or instant preview. If you skip, I'll keep realtime out of the bundle and leave the rest of visual editing in place."

2. **Realtime owner** — an existing realtime implementation has conflicting ownership and it is genuinely unclear which page wrapper or subscription helper should remain the source of truth.

   Ask one question:

   > "This repo already has more than one realtime-style wrapper. Which one should stay the source of truth? Recommended default: preserve the wrapper already paired with draft mode or the primary page shell. If you skip, I'll patch the strongest existing owner and list the alternatives under unresolved placeholders."

Otherwise, proceed directly.

## Step 3: Load References

Read the relevant reference files. Load only what is needed.

**Always load:**

- `../../../../datocms-frontend-integrations/references/realtime-concepts.md`

**Load per framework — focus on the `## Real-Time Updates (Optional)` section:**

| Framework | Reference file |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro.md` |

**Load the framework-appropriate component reference:**

| Framework | Component reference |
| - | - |
| Next.js (React) | `../../../../datocms-frontend-integrations/references/react-realtime.md` |
| Nuxt (Vue) | `../../../../datocms-frontend-integrations/references/vue-realtime.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/svelte-realtime.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro-realtime.md` |

## Step 4: Generate Code

Generate framework-specific real-time update components and patterns:

### Next.js (React)

Generate two files in `src/lib/datocms/realtime/` (or `lib/datocms/realtime/` if no `src/`):

1. **`generateRealtimeComponent.tsx`** — A factory function that creates a real-time wrapper component for any page. Takes a `useQuerySubscription`-compatible config and returns a client component that:
   - Uses `useQuerySubscription` from `react-datocms`
   - Passes `includeDrafts`, `excludeInvalid`, and the draft CDA token
   - If Content Link is configured: passes `contentLink` and `baseEditingUrl`
   - Renders the page component with live data

2. **`generatePageComponent.tsx`** — A factory function that creates the server/client page split. Takes the static page component and the GraphQL query, returns a component that:
   - In draft mode: renders the real-time wrapper
   - In production: renders the static page component

### Nuxt (Vue)

Generate a usage pattern/example showing how to use `useQuerySubscription` composable from `vue-datocms`:

- Wrap existing page data fetching with the composable
- Pass `includeDrafts`, `excludeInvalid`, and the draft CDA token
- If Content Link is configured: pass `contentLink` and `baseEditingUrl`
- Access `data`, `error`, `status` as Vue `Ref` values

### SvelteKit

Generate a usage pattern/example showing how to use `querySubscription` store from `@datocms/svelte`:

- Create a Svelte store with `querySubscription()`
- Access with `$subscription` syntax
- Use `$: ({ data, error, status } = $subscription)` for reactive destructuring
- Pass `includeDrafts`, `excludeInvalid`, and the draft CDA token
- If Content Link is configured: pass `contentLink` and `baseEditingUrl`

### Astro

Generate a usage pattern/example showing how to use `<QueryListener />` from `@datocms/astro/QueryListener`:

- Import from `@datocms/astro/QueryListener` (subpath import)
- `<QueryListener />` triggers page reload on content changes (NOT live data like React/Vue/Svelte)
- Options must match the `executeQuery` options (token, includeDrafts, excludeInvalid)
- If Content Link is configured: pass `contentLink` and `baseEditingUrl`
- Only render in draft mode context

### Mandatory rules for all generated code

#### Subscription options

- Pass the draft CDA token (not the published token) for real-time subscriptions
- Always include `includeDrafts: true` and `excludeInvalid: true`
- If Content Link is configured, include `contentLink: 'v1'` and `baseEditingUrl`

#### TypeScript

Follow the TypeScript rules in `../../../patterns/MANDATORY_RULES.md`.

#### Env var conventions

Follow the env conventions in `../../../patterns/MANDATORY_RULES.md`.

Recipe-specific env var names:

- Next.js: `DATOCMS_DRAFT_CONTENT_CDA_TOKEN`
- Nuxt: `useRuntimeConfig().datocms.draftContentCdaToken`
- SvelteKit: `PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN`
- Astro: draft CDA token from `astro:env/server`

#### File conflicts

Follow the file conflict rules in `../../../patterns/MANDATORY_RULES.md`.

## Step 5: Install Dependencies

Install missing packages:

| Package | When |
| - | - |
| `react-datocms` | Next.js (if not already installed) |
| `vue-datocms` | Nuxt (if not already installed) |
| `@datocms/svelte` | SvelteKit (if not already installed) |
| `@datocms/astro` | Astro (if not already installed) |

Use the project's package manager (see `../../../patterns/MANDATORY_RULES.md`).

## Step 6: Final handoff

After generating all files, tell the user:

1. how an existing page or shared page wrapper should adopt the realtime helper
2. whether realtime was added as a standalone enhancement or as part of the broader `visual-editing` bundle
3. the SSE connection limit reminder — DatoCMS allows up to 500 concurrent SSE connections per project, and each open browser tab in draft mode uses one connection
4. whether the result is `scaffolded` or `production-ready`
5. the optional follow-up recipe id `visual-editing` if the user still wants Web Previews plus click-to-edit orchestration on top of realtime

Treat the result as `scaffolded` if the repo still depends on placeholder page-integration steps, missing draft-token values, or unresolved ownership of the realtime wrapper. Report `production-ready` only when at least one real page or reusable wrapper is wired end to end with intentional repo values.

Follow the shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including an explicit `Unresolved placeholders` section.

## Verification Checklist

Before presenting the final code, verify:

1. Real-time subscription passes the draft CDA token (not published)
2. Subscription includes `includeDrafts: true` and `excludeInvalid: true`
3. If Content Link is configured, subscription includes `contentLink` and `baseEditingUrl`
4. Next.js: `generateRealtimeComponent.tsx` and `generatePageComponent.tsx` are created
5. Nuxt: usage example uses `useQuerySubscription` composable correctly with Vue refs
6. SvelteKit: usage example uses `querySubscription` store with `$subscription` syntax
7. Astro: uses `<QueryListener />` from subpath import, triggers page reload (not live data)
8. Astro: `<QueryListener />` only renders in draft mode
9. All generated TypeScript follows the mandatory rules (no `as unknown as`, inferred types, `import type`)
