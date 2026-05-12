_Internal recipe for `datocms-setup`. Use only after parent skill selects `responsive-images` recipe and queues prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Responsive Images Setup

Expert at wiring DatoCMS responsive images into existing frontend projects. Recipe creates/patches one shared Dato image wrapper, normalizes `responsiveImage(...)` query shapes, patches real usage site when repo already exposes image field.

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

Follow steps in order. Do not skip.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Silently examine project:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals below.

1. **Framework** — detect Next.js, Nuxt, SvelteKit, or Astro
2. **UI package** — inspect `package.json` for `react-datocms`, `vue-datocms`, `@datocms/svelte`, and `@datocms/astro`
3. **Existing Dato query utility** — inspect shared query wrapper and Dato helper folder
4. **Existing image usage** — search for `responsiveImage`, `coverImage`, `heroImage`, `seoImage`, and current wrapper components
5. **File layout** — detect `src/` vs non-`src/`, plus any existing `lib/datocms`, `components/datocms`, or similar shared area
6. **Typed query context** — preserve gql.tada or GraphQL Code Generator usage if repo already has it

### Stop conditions

- If framework cannot be determined, ask user which supported stack they are using.
- If repo already has materially different image abstraction, patch it in place by default instead of replacing wholesale.

## Step 2: Ask Questions

Infer first from repo.

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you do ask, make one concise question, put recommended/default path first, explain whether skipping it will leave placeholders, ownership, or project-specific values unresolved.

Only ask if repo exposes multiple competing image abstractions and unclear which one owns rendered output.

## Step 3: Load References

Read only these references:

- `../../../../datocms-cda/references/client-and-config.md`
- `../../../../datocms-cda/references/images-and-videos.md`

Then load matching framework references:

| Framework | Reference |
| - | - |
| Next.js / React | `../../../../datocms-frontend-integrations/references/react-image.md` |
| Nuxt / Vue | `../../../../datocms-frontend-integrations/references/vue-image.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/svelte-image.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro-image.md` |

If repo has no shared Dato query utility yet, also inspect matching framework guidance used by CDA client baseline:

| Framework | Reference |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro.md` |

## Step 4: Generate Code

Generate smallest reusable responsive-image setup that fits repo.

### Required project changes

1. **Install framework package if missing**
   - React / Next.js -> `react-datocms`
   - Vue / Nuxt -> `vue-datocms`
   - SvelteKit -> `@datocms/svelte`
   - Astro -> `@datocms/astro`
2. **Create or patch shared Dato query utility**
   - If one exists, patch in place
   - If none exists, create same thin published-content CDA baseline used by setup bundle's CDA client setup
3. **Create one shared Dato image wrapper**
   - Reuse repo's existing Dato helper area
   - If none exists, place under Dato lib folder:
     - with `src/`: `src/lib/datocms/DatoImage.*`
     - without `src/`: `lib/datocms/DatoImage.*`
     - Nuxt may also use `components/datocms/DatoImage.vue` when that better matches repo's structure
4. **Patch one obvious query or component usage**
   - Prefer existing hero, cover, card, or SEO image field already rendered on site
   - If no safe target exists, create only shared wrapper and report `scaffolded`

### Wrapper defaults

- **React / Next.js:** default to `<SRCImage />`; support opt-in path to `<Image />` only for transparency, crossfade, or custom intersection tuning
- **Vue / Nuxt:** default to `<NakedImage>`; support opt-in path to `<Image>`
- **SvelteKit:** default to `<NakedImage />`; support opt-in path to `<Image />`
- **Astro:** wrap native `@datocms/astro/Image` component only

### Required query shape

Patch real image fields toward this shape:

```graphql
responsiveImage(imgixParams: { auto: format }) {
  src
  width
  height
  alt
  title
  base64
}
```

Add `sizes` only when rendered component needs it. Prefer omitting `srcSet` unless project clearly needs explicit CDN-generated variants.

### Mandatory rules

- Always use `responsiveImage(imgixParams: { auto: format })`
- Never request both `base64` and `bgColor`
- Prefer omitting `srcSet` unless repo clearly needs it
- Preserve framework-specific prop casing:
  - React -> `pictureClassName`, `imgClassName`
  - Vue -> `picture-class`, `img-class`, `src-set-candidates`
  - Svelte / Astro -> `pictureClass`, `imgClass`, `srcSetCandidates`
- Astro imports must use `@datocms/astro/Image`, never `@datocms/astro`
- Patch existing query ownership in place instead of adding parallel query path

### Output status

- Report `scaffolded` if only wrapper was created, if no real image field was patched, or if query shape still contains placeholders
- Report `production-ready` only when concrete Dato image field renders through shared wrapper with no unresolved responsive-image TODOs

## Step 5: Next Steps

After generating files, tell user:

1. Which image field was patched, if any
2. Which wrapper component was created and where
3. Whether repo is still `scaffolded` because real field integration was not safe to patch automatically
4. Whether thin shared CDA query utility had to be created as part of setup

## Verification Checklist

Before presenting result, verify:

1. Framework-appropriate Dato image package is installed or added
2. Repo has shared Dato query utility after change
3. Shared image wrapper matches framework defaults
4. Patched query uses `responsiveImage(imgixParams: { auto: format })`
5. Query does not request both `base64` and `bgColor`
6. Astro uses only `@datocms/astro/Image` subpath imports
7. Result is `scaffolded` if no real image field could be integrated
