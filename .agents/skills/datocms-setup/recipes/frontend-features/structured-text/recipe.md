_Internal recipe for `datocms-setup`. Use after parent skill selects `structured-text` and queues `../../../references/recipe-manifest.json` prerequisites._

# DatoCMS Structured Text Setup

Expert Structured Text rendering in existing frontends. Creates shared `DatoStructuredText` renderer, patches query shapes to full DAST payload, integrates Content Link boundaries when visual editing configured.

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

Follow steps in order. Don't skip.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Examine project:

Follow repo inspection in `../../../references/repo-conventions.md`, then inspect:

1. **Framework** — detect Next.js, Nuxt, SvelteKit, Astro
2. **UI package** — inspect `package.json` for `react-datocms`, `vue-datocms`, `@datocms/svelte`, `@datocms/astro`
3. **Existing Dato query utility** — inspect shared query wrapper and Dato helper folder
4. **Existing Structured Text usage** — search `StructuredText`, `.value`, `inlineBlocks`, `renderBlock`, `blockComponents`, current DAST helpers
5. **Existing custom block or link components** — reuse where practical
6. **Content Link state** — detect whether stega / Content Link configured so boundaries/groups added correctly
7. **Typed query context** — preserve gql.tada or GraphQL Code Generator usage if present

### Stop conditions

- If framework undetermined, ask user which supported stack they use.
- If repo has materially different Structured Text abstraction, patch in place by default instead of replacing wholesale.

## Step 2: Ask Questions

Infer from repo first.

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you ask, make one concise question, put recommended/default path first, explain whether skipping leaves placeholders, ownership, or project-specific values unresolved.

Only ask if repo exposes multiple incompatible Structured Text renderers and genuinely unclear which one owns production rendering.

## Step 3: Load References

Read only:

- `../../../../datocms-cda/references/client-and-config.md`
- `../../../../datocms-cda/references/structured-text.md`

Then load matching framework reference:

| Framework | Reference |
| - | - |
| Next.js / React | `../../../../datocms-frontend-integrations/references/react-structured-text.md` |
| Nuxt / Vue | `../../../../datocms-frontend-integrations/references/vue-structured-text.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/svelte-structured-text.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro-structured-text.md` |

If Content Link configured, also load:

| Framework | Reference |
| - | - |
| Next.js / React | `../../../../datocms-frontend-integrations/references/react-content-link.md` |
| Nuxt / Vue | `../../../../datocms-frontend-integrations/references/vue-content-link.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/svelte-content-link.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro-content-link.md` |

If no shared Dato query utility, inspect matching framework guidance from CDA client baseline:

| Framework | Reference |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro.md` |

## Step 4: Generate Code

Generate reusable Structured Text renderer matching framework.

### Required project changes

1. **Install framework package if missing**
   - React / Next.js -> `react-datocms`
   - Vue / Nuxt -> `vue-datocms`
   - SvelteKit -> `@datocms/svelte`
   - Astro -> `@datocms/astro`
2. **Install DAST helper packages only when required by generated pattern**
   - Svelte predicate-component setups require `datocms-structured-text-utils`
   - Add other DAST helper packages only if generated renderer uses them
3. **Create or patch shared Dato query utility**
   - If exists, patch in place
   - If none, create thin published-content CDA baseline used by setup bundle's CDA client setup
4. **Create shared `DatoStructuredText` renderer**
   - Reuse repo's existing Dato helper area
   - If none, place under Dato lib folder:
     - with `src/`: `src/lib/datocms/DatoStructuredText.*`
     - without `src/`: `lib/datocms/DatoStructuredText.*`
5. **Add required sidecar renderer files**
   - React -> keep render callbacks in wrapper or colocated helpers
   - Vue -> keep `h()` renderers in wrapper or small composable sidecars
   - Svelte -> create predicate/component sidecars
   - Astro -> create `__typename`-keyed `.astro` sidecars
6. **Patch one obvious Structured Text usage**
   - Prefer existing page body, article body, or content section in production flow
   - If no safe target, create only shared renderer and report `scaffolded`

### Required query shape

When field is more than simple `value`-only content, patch toward:

```graphql
content {
  value
  links {
    ... on RecordInterface {
      id
      __typename
    }
  }
  blocks {
    ... on RecordInterface {
      id
      __typename
    }
  }
  inlineBlocks {
    ... on RecordInterface {
      id
      __typename
    }
  }
}
```

Extend concrete fragments only for record types patched page already uses.

### Framework renderer rules

- **React / Next.js:** use `renderBlock`, `renderInlineRecord`, `renderLinkToRecord`, `renderInlineBlock`
- **Vue / Nuxt:** use same rendering categories via `h()` callbacks
- **SvelteKit:** use predicate-component tuples and sidecar `.svelte` files
- **Astro:** use `blockComponents`, `inlineBlockComponents`, `inlineRecordComponents`, `linkToRecordComponents` keyed by `__typename`

### Content Link rules

If Content Link configured:

- Wrap main `<StructuredText>` renderer in `data-datocms-content-link-group`
- Add `data-datocms-content-link-boundary` to block, inline block, inline record render targets
- Don't add boundaries to record-link renderers

### Mandatory rules

- Support `value`, `links`, `blocks`, `inlineBlocks` by default in reusable renderer
- Always require `id` and `__typename` on linked records, blocks, inline blocks
- Reuse existing custom block components when present instead of creating duplicates
- Patch existing query ownership in place instead of adding second query path
- Don't mark result `production-ready` while any discovered record type handled by placeholder switch case or TODO component

### Output status

- Report `scaffolded` if only reusable renderer created, if no real field patched, or if any record-type mapping still contains placeholders
- Report `production-ready` only when concrete Structured Text field renders through shared wrapper and every discovered record type in patched query has concrete handling

## Step 5: Next Steps

After generating files, tell user:

1. Which Structured Text field patched, if any
2. Which shared renderer and sidecar files created
3. Whether Content Link boundaries added
4. Whether repo still `scaffolded` because concrete record mappings or live field integration remain unresolved

## Verification Checklist

Before presenting result, verify:

1. Framework-appropriate Dato Structured Text package installed or added
2. Repo has shared Dato query utility after change
3. Shared renderer supports `value`, `links`, `blocks`, `inlineBlocks`
4. Patched query includes `id` and `__typename` on every linked record, block, inline block
5. Framework-specific rendering model matches chosen stack
6. Content Link groups and boundaries added correctly when feature already configured
7. Result is `scaffolded` if no real Structured Text field patched or any discovered record type still has placeholder handling
