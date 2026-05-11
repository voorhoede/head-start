_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `visual-editing` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Visual Editing Setup

This recipe is the orchestration layer for the full editorial preview experience. It coordinates the focused implementation recipes so the repo ends up with one coherent visual-editing workflow instead of disconnected preview pieces.

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

## Step 1: Detect Context (silent)

Silently examine the project:

Follow the shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect the recipe-specific signals below.

1. **Framework and UI stack** — detect the supported framework and any installed DatoCMS rendering packages.
2. **Existing preview foundations** — inspect whether the repo already has:
   - draft mode
   - preview-links / Web Previews wiring
   - Content Link wiring
   - real-time preview wiring
3. **Vercel conflict signals** — inspect for Vercel Content Link / Edit Mode wiring so duplicate overlay systems are never enabled together.
4. **Route and site-url helpers** — inspect existing route builders, public URL helpers, and site URL env vars.
5. **Frontend count** — inspect whether the repo clearly serves one frontend or multiple frontends/environments.

## Step 2: Ask Questions

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Only ask the grouped visual-editing follow-up when the repo inspection does not already answer the decisions safely:

> "For visual editing, should I set up: (1) website click-to-edit only, (2) side-by-side editing inside DatoCMS only, or (3) both? Recommended default: both.

Do you also want real-time updates while editors type? Recommended default: no unless you explicitly want live preview.

Should I prepare the Web Previews handoff for a single frontend or multiple named frontends/environments? Recommended default: single frontend.

If you skip, I'll default to both editing modes, keep real-time off, assume one frontend, and mark any missing route/plugin details as `scaffolded`."

If Vercel Content Link / Edit Mode is already present and no earlier bundle decision resolved it, ask this first instead:

> "This repo already appears to use Vercel Content Link / Edit Mode. Do you want to preserve that setup, replace it with DatoCMS Visual Editing, or switch only the side-by-side DatoCMS workflow on? Recommended default: preserve the existing Vercel setup unless you explicitly want DatoCMS side-by-side editing. If you skip, I'll preserve the Vercel overlays and avoid duplicate overlays."

## Step 3: Load References

Always load:

- `../../../../datocms-frontend-integrations/references/visual-editing-concepts.md`
- `../../../../datocms-frontend-integrations/references/draft-mode-concepts.md`
- `../../../../datocms-frontend-integrations/references/content-link-concepts.md`
- `../../../../datocms-frontend-integrations/references/web-previews-concepts.md`
- `../../../../datocms-frontend-integrations/references/realtime-concepts.md` only when the bundle decision includes real-time updates

Do not load framework-specific implementation refs here unless you need them to resolve the bundle decision itself. The focused prerequisite recipes will load the exact framework refs they need.

## Step 4: Apply the bundle

Apply the visual-editing bundle in this order, reusing any existing foundation already present in the repo:

1. **Always apply `draft-mode`**
2. **Always apply `content-link`** unless the conflict-resolution decision preserved an existing Vercel-only website overlay flow
3. **Apply `web-previews`** unless the chosen mode is explicitly website-only click-to-edit
4. **Apply `realtime`** only when the user explicitly asked for live/real-time updates or the grouped follow-up answered `yes`

Bundle rules:

- patch the shared query wrapper once, then layer the other behaviors on top
- reuse one route mapping strategy across Web Previews and related preview helpers
- reuse one draft secret and one base editing URL strategy
- never leave Vercel overlays and Dato overlays active simultaneously
- if the repo already has one or more layers, extend them in place instead of rebuilding them

## Step 5: Final verification

Treat the bundle as `scaffolded` if any selected layer is still scaffolded, any overlay conflict is unresolved, or any required route/token/base-editing-url value still depends on placeholders.

Report `production-ready` only when every selected layer is production-ready and the combined flow works end to end.

The manual check that matters most:

1. open a preview from DatoCMS
2. confirm the page renders draft content
3. confirm click-to-edit opens the intended field
4. if Web Previews is enabled, confirm the side-by-side preview follows record/page navigation
5. if real-time updates are enabled, confirm an editor change appears without a rebuild

## Step 6: Final handoff

Summarize:

- which bundle layers were applied or reused
- whether the repo kept an existing Vercel overlay flow or switched fully to DatoCMS visual editing
- the exact Web Previews handoff values, if Web Previews is part of the bundle
- whether the final result is `scaffolded` or `production-ready`

Follow the shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including an explicit `Unresolved placeholders` section.
