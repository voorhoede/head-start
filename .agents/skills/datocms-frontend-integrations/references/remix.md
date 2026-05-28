# Remix

Use this file when the project is Remix. Keep the framework wiring narrow and lean on the React component references for rendering concerns.

## Scope

- Use the existing Remix loader/action structure already present in the repo
- Keep CDA requests on the server by default
- Reuse the React references for images, Structured Text, video, SEO, Content Link, and real-time preview UI

## Practical routing

- framework conventions, route files, loader/action placement -> the current Remix repo structure
- rendering concerns -> the React reference files in this skill
- SEO helpers -> `react-seo.md` (including Remix-specific helpers when present)
- visual editing / realtime -> the React Content Link / realtime references, adapted to the repo's existing Remix data flow

## Guardrails

- Patch existing loaders and route modules in place instead of inventing a new abstraction layer
- Keep secrets server-side
- If the repo is greenfield and the user wants a one-shot scaffold, note that dedicated `datocms-setup` recipes are not bundled here yet; stay in this skill and patch the concrete Remix app directly
