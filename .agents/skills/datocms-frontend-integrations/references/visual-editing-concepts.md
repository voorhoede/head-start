# Visual Editing Concepts

Use this reference when the user wants the full DatoCMS visual-editing workflow, not just one isolated ingredient.

## What counts as Visual Editing

Visual Editing is the combined editorial preview workflow built from:

1. **Draft Mode** — serve unpublished content
2. **Content Link** — click-to-edit overlays
3. **Web Previews** — side-by-side preview inside DatoCMS
4. **Real-time Updates** — live feedback while editors type

The full experience is strongest when all four pieces are present, but they can be adopted incrementally.

## Two editing modes

- **Website click-to-edit only** — draft content plus Content Link overlays in the website itself
- **Side-by-side inside DatoCMS** — draft content, Web Previews, and Content Link together inside the DatoCMS iframe
- **Both** — recommended default when the user broadly asks for visual editing

Unless the user explicitly asks for live updates, treat Real-time Updates as an optional add-on instead of a mandatory default.

## Default bundle decisions

When the request is broad and the repo does not force a different answer:

- default mode: **both**
- default real-time: **off** unless the user explicitly asks for live/instant preview
- default frontend count: **single frontend** unless the repo clearly serves multiple sites or environments

## Vercel conflict rule

Vercel Content Link / Edit Mode and DatoCMS Content Link both render overlay-style editing affordances. Do not enable both simultaneously.

If the repo already appears to use Vercel Content Link:

- prefer **DatoCMS Visual Editing** when the user explicitly asks for side-by-side editing, Web Previews, or the full visual-editing workflow
- prefer **preserving the existing Vercel setup** when the user only wants website click-to-edit behavior and the current setup is already working
- if the intent is ambiguous, ask one conflict-resolution question before changing anything

## Plugin-side handoff fields

When Web Previews is part of the bundle, the final handoff must always name:

- frontend label (`Primary`, `Staging`, etc.)
- Preview Links API endpoint
- Draft Mode URL
- initial path default
- viewport preset recommendation
- custom headers or query-secret expectation
- unresolved model-to-route mappings, if any

## Output status rule

Treat the full bundle as `scaffolded` if any bundled layer is still scaffolded, any overlay conflict is unresolved, or any route/token/base-editing-url placeholder remains. Report `production-ready` only when the combined flow works end to end without unresolved placeholders.
