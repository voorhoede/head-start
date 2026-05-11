# Setup Router

Use this file to choose the right internal recipe bundle without loading the entire setup tree.

## Targeted Mode

If the user clearly asks for one of these outcomes, load only that recipe plus its prerequisites from `recipe-manifest.json`:

| Group | Recipe ids | Typical user intents |
| - | - | - |
| `frontend-foundation` | `cda-client`, `draft-mode`, `web-previews`, `content-link`, `realtime`, `visual-editing`, `cache-tags`, `graphql-types` | query baseline, previews, website click-to-edit, side-by-side editing, live preview, cache invalidation, typed queries |
| `frontend-features` | `responsive-images`, `structured-text`, `video-player`, `site-search`, `seo`, `robots-sitemaps` | media rendering, rich text, search, metadata, sitemap wiring |
| `migrations` | `migrations`, `migration-release-workflow`, `blueprint-sync`, `sandbox-iteration`, `cli-profiles`, `migration-autogenerate` | schema workflow, promotion, shared history, sandbox reset, profiles, diff-based generation |
| `onboarding` | `contentful-import`, `wordpress-import` | one-shot import helpers |
| `platform` | `cma-types`, `webhooks`, `build-triggers` | schema types, webhook sync, build trigger management |

## Discovery Mode

Use discovery mode only when the user asks for broad setup such as “set up DatoCMS for this project” or mixes several unrelated setup goals.

### Stage A — choose the lane

Ask one compact grouped clarification pass that covers:

1. Which setup lane they want first: frontend foundation, frontend features, migrations, onboarding, or platform.
2. Whether they need published-only reads, preview/editor workflows, or the full `visual-editing` bundle.
3. Whether imports, schema workflows, or platform automation are in scope right now.

Then select the smallest recipe bundle that satisfies the answer set.

### Stage B — ask only the smallest unresolved bundle-specific follow-up

Only ask a second pass when repo inspection still leaves a high-impact decision unresolved:

- **`visual-editing`** — Ask one grouped follow-up covering:
  1. mode = website click-to-edit only / side-by-side inside DatoCMS only / both (**recommended**)
  2. real-time updates = yes / no (**recommended no unless the user explicitly asked for live updates**)
  3. frontend shape = single frontend (**recommended**) / multiple frontends-environments
- **Vercel overlay conflict** — If the repo signals existing Vercel Edit Mode / Vercel Content Link, ask one conflict-resolution question before changing overlays. Recommend **Dato Visual Editing** when the user asked for Web Previews, side-by-side editing, or the full visual-editing workflow. Recommend **preserving the existing Vercel overlays** when the user asked only for website click-to-edit and the current Vercel setup already works. Never do both.
- **`site-search`** — Ask one-vs-many index topology only when the repo clearly exposes multiple top-level public sections and the correct boundaries cannot be inferred safely. Recommend one shared index first.
- **`graphql-types`** — Preserve the repo’s existing type-generation approach when present. Default greenfield setups to `gql.tada`. Ask only when both approaches already coexist or when the user explicitly requests a choice.
- **`cma-types`** — Default for any TypeScript project that touches the CMA. Provides a fully typed CMA experience end-to-end. Queue alongside `cli-bootstrap` on greenfield setups; do not gate behind explicit opt-in.
- **`build-triggers`, `webhooks`, `cache-tags`, `cli-profiles`, `blueprint-sync`, `migration-release-workflow`** — Infer first, then ask the smallest explicit choice point with the recommended/default path first.
- **`migrations` lane** — Ask one additional grouped follow-up only when needed to separate baseline migrations, named profiles, shared migration history, release helper, sandbox reset loop, and diff-based generation.

## Sibling Skills (No Recipe)

Some intents have no setup recipe — defer to a sibling DatoCMS skill, don't invent scaffolding here.

| Intent | Sibling skill |
| - | - |
| Schema design, model vs block decisions, field shapes, taxonomy, content reuse, page-shaped schema refactor | `datocms-content-modeling` |

Greenfield gate "create new project" → queue `datocms-content-modeling` after creation, before any frontend recipe. In-flight request to add/modify models → pause recipe, route to `datocms-content-modeling`, resume after schema decisions land.

## Prerequisite Rules

- Queue `draft-mode` before `web-previews`, `content-link`, or `realtime` when that foundation is missing.
- For `visual-editing`, always apply `draft-mode` and `content-link`; add `web-previews` unless website-only click-to-edit was chosen; add `realtime` only on explicit or confirmed live-update intent.
- Queue `cda-client` before `cache-tags` when the shared query wrapper is missing.
- Queue `migrations` before `migration-release-workflow`, `blueprint-sync`, `sandbox-iteration`, or `migration-autogenerate` when that baseline is missing.
- Dedupe shared foundations across the bundle and apply them once.

## Bundle Rules

- Prefer one run with queued prerequisites over telling the user to run another setup skill.
- Keep follow-up suggestions inside `datocms-setup` and refer to recipe ids only.
- Treat `visual-editing` as an internal bundle alias, not a replacement for direct recipe ids such as `content-link` or `web-previews`.
- Load recipe-local assets and scripts only for the selected recipes.
- Prefer sibling skill references over copied shared docs when a recipe reuses another DatoCMS skill's material.
