_Internal recipe for `datocms-setup`. After parent skill selects `video-player` recipe and queues prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Video Player Setup

Expert: wire DatoCMS streaming video into frontend. Create shared `DatoVideoPlayer` wrapper, normalize Dato video query shape, patch real usage site when repo exposes video field.

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

Examine project silently:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals.

1. **Framework** — detect Next.js, Nuxt, SvelteKit, Astro
2. **UI package** — inspect `package.json` for `react-datocms`, `vue-datocms`, `@datocms/svelte`, `@datocms/astro`, any Astro React integration
3. **Existing Dato query utility** — inspect shared query wrapper and Dato helper folder
4. **Existing video usage** — search for `muxPlaybackId`, `blurUpThumb`, `VideoPlayer`, `mux-player`, `video {`, likely content models: hero videos or media blocks
5. **Content Link state** — detect whether stega / Content Link already set up so query fields like `alt` are preserved when needed
6. **File layout** — detect `src/` vs non-`src/` and repo's current Dato component area

### Stop conditions

- If framework cannot be determined, ask user which supported stack they are using.
- If repo already has materially different video abstraction, patch it in place by default instead of replacing it wholesale.
- If project is Astro without React integration and relies only on `@datocms/astro`, stop with explicit explanation: no native `@datocms/astro` video player component in v1.

## Step 2: Ask Questions

Infer first from repo.

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

If you do ask, make one concise question, put recommended/default path first, explain whether skipping it will leave placeholders, ownership, or project-specific values unresolved.

Only ask if Astro project appears to have partial React integration and it is unclear whether reusing that path is safe.

## Step 3: Load References

Read only these references:

- `../../../../datocms-cda/references/client-and-config.md`
- `../../../../datocms-cda/references/images-and-videos.md`

Then load matching supported video reference:

| Framework | Reference |
| - | - |
| Next.js / React | `../../../../datocms-frontend-integrations/references/react-video-player.md` |
| Nuxt / Vue | `../../../../datocms-frontend-integrations/references/vue-video-player.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/svelte-video-player.md` |

If Content Link already configured, also load matching Content Link reference:

| Framework | Reference |
| - | - |
| Next.js / React | `../../../../datocms-frontend-integrations/references/react-content-link.md` |
| Nuxt / Vue | `../../../../datocms-frontend-integrations/references/vue-content-link.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/svelte-content-link.md` |
| Astro with React integration | `../../../../datocms-frontend-integrations/references/react-content-link.md` |

If repo has no shared Dato query utility yet, also inspect matching framework guidance used by CDA client baseline:

| Framework | Reference |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro with React integration | `../../../../datocms-frontend-integrations/references/astro.md` |

## Step 4: Generate Code

Generate smallest reusable Dato video-player setup that fits repo.

### Supported stacks

- Next.js / plain React via `react-datocms`
- Nuxt / plain Vue via `vue-datocms`
- SvelteKit via `@datocms/svelte`
- Astro only when repo already uses React integration and video path clearly belongs to `react-datocms`

### Required project changes

1. **Install framework package if missing**
   - React -> `react-datocms`
   - Vue -> `vue-datocms`
   - SvelteKit -> `@datocms/svelte`
2. **Install correct Mux peer dependency**
   - React -> `@mux/mux-player-react`
   - Vue / SvelteKit -> `@mux/mux-player`
3. **Create or patch shared Dato query utility**
   - If one already exists, patch it in place
   - If none exists, create same thin published-content CDA baseline used by setup bundle's CDA client setup
4. **Create one shared `DatoVideoPlayer` wrapper**
   - Reuse repo's existing Dato helper area
   - If none exists, place under Dato lib folder:
     - with `src/`: `src/lib/datocms/DatoVideoPlayer.*`
     - without `src/`: `lib/datocms/DatoVideoPlayer.*`
5. **Patch one obvious usage site**
   - Prefer existing hero video, media block, or content page that already reads a Dato video field
   - If no safe target exists, create only shared wrapper and report `scaffolded`

### Required query shape

Patch real video fields toward this shape:

```graphql
video {
  muxPlaybackId
  title
  width
  height
  blurUpThumb
  alt
}
```

### Wrapper defaults

Preserve library's privacy-first defaults:

- `disableCookies: true`
- `disableTracking: true` where selected component supports it
- `preload="metadata"`
- `style.aspectRatio` derived from `width` and `height` when both present

### Mandatory rules

- Use correct Mux package for selected framework
- Never claim native `@datocms/astro` video-player support in v1
- Preserve `alt` in query when Content Link already configured
- Patch existing query ownership in place instead of adding parallel query path
- Do not mark result `production-ready` without real video field wired through shared wrapper

### Output status

- Report `scaffolded` if only wrapper was created, if no real video field was patched, or if required peer dependencies / supported integration remain unresolved
- Report `production-ready` only when supported stack has at least one real Dato video field wired through shared wrapper with no unresolved TODOs

## Step 5: Next Steps

After generating files, tell user:

1. Which video field was patched, if any
2. Which shared wrapper component was created and where
3. Whether Content Link forced query to keep `alt`
4. Whether repo remains `scaffolded` because no safe video integration target was found or supported runtime path is still missing

## Verification Checklist

Before presenting result, verify:

1. Framework-appropriate Dato video package is installed or added
2. Correct Mux peer dependency is installed or added
3. Repo has shared Dato query utility after the change
4. Patched video query includes `muxPlaybackId`, `title`, `width`, `height`, `blurUpThumb`, and `alt`
5. Shared wrapper preserves privacy-first defaults and `preload="metadata"`
6. Unsupported native-Astro-only projects stop with clear explanation
7. Result is `scaffolded` if no real video field could be integrated
