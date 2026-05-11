# Setup Repo Conventions

Use this reference before any recipe-specific inspection. It keeps shared repo discovery rules out of the individual setup recipes.

## Shared inspection baseline

Start every setup recipe by confirming:

1. the strongest supported framework or runtime signal
2. whether the repo uses `src/`
3. the package manager and lockfile convention
4. the env-file convention already present in the repo
5. the strongest existing owner for any related helper, endpoint, route, or shared utility

Prefer extending the strongest existing owner instead of creating a parallel implementation.

## Supported framework detection

Treat these package signals as the source of truth for supported frontend frameworks:

| Framework | Package signal |
| - | - |
| Next.js App Router | `next` |
| Nuxt | `nuxt` |
| SvelteKit | `@sveltejs/kit` |
| Astro | `astro` |

If none of these signals are present and the recipe depends on one of these frameworks, ask the user which supported stack they are using.

For recipes that can still proceed without a supported frontend framework (for example some platform or CLI setups), continue with the non-framework parts and call out the unsupported area explicitly.

## File-layout conventions

Use the repo's actual structure first. When the repo has no stronger signal, start from these standard locations:

| Concern | With `src/` | Without `src/` |
| - | - | - |
| Next.js app routes | `src/app/...` | `app/...` |
| Next.js shared Dato helpers | `src/lib/datocms/...` | `lib/datocms/...` |
| SvelteKit routes | `src/routes/...` | `src/routes/...` |
| SvelteKit shared Dato helpers | `src/lib/datocms/...` | `src/lib/datocms/...` |
| Astro pages | `src/pages/...` | `src/pages/...` |
| Astro layouts | `src/layouts/...` | `src/layouts/...` |
| Astro shared Dato helpers | `src/lib/datocms/...` | `lib/datocms/...` |

Nuxt usually keeps server routes under `server/`, layouts under `layouts/`, top-level shell files under `app.vue`, and shared helpers in the existing project convention (`composables/`, `lib/`, `utils/`, or `server/utils/`).

## Package manager and env files

Use the repo's lockfile or existing script style to determine the package manager. When nothing stronger exists, follow the package-manager rules in `../patterns/MANDATORY_RULES.md`.

Inspect the env files that already exist in the repo first. When a recipe needs new placeholders, follow the framework env-file and prefix conventions in `../patterns/MANDATORY_RULES.md` instead of inventing a new convention.

## Existing-owner and patch-in-place defaults

Inspect any existing implementation before deciding to scaffold new files:

- shared query wrappers
- route-mapping helpers
- preview or webhook endpoints
- shared UI wrappers or renderer components
- CLI helper scripts
- existing Dato config files

When several possible owners exist, preserve the most central working owner by default. Ask only when picking the wrong owner would materially change behavior or leave the setup unsafe.
