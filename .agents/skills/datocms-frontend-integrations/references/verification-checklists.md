# Verification Checklists

Use only the sections that match the work you actually performed.

## Contents

- Setup Flows
- Component Integrations
- Search and Crawl

## Setup Flows

### Draft Mode

- Enable flow validates the shared secret token.
- Disable flow clears draft state without requiring authentication.
- Redirect targets are validated with `isRelativeUrl()`.
- Cookies use iframe-safe attributes where required.
- The shared query wrapper supports `includeDrafts`, token switching, and `excludeInvalid: true`.
- Secrets come from environment variables only.

### Web Previews

- Preview-links endpoint validates the shared secret token.
- CORS headers and `OPTIONS` handling are present.
- Unexpected errors are serialized consistently.
- CSP allows `https://plugins-cdn.datocms.com` in `frame-ancestors`.
- Record-to-route mappings are complete, or the missing mappings are called out clearly.

### Content Link

- Draft queries enable `contentLink: 'v1'` and `baseEditingUrl`.
- Production queries do not ship stega output.
- The root `ContentLink` component is mounted in the right place.
- Router integration matches the framework:
  - React / Next.js uses `onNavigateTo` and `currentPath`.
  - Vue / Nuxt uses `on-navigate-to` and `current-path`.
  - SvelteKit uses `onNavigateTo` and `currentPath`.
  - Astro uses only its supported props.
- Structured Text boundaries are present only where the framework expects them.
- **Stega leakage check.** Every text/string field value coming from the CDA is only used for direct render (text/HTML output). Any non-render use — equality / `includes` / `switch` comparisons, `split` / `replace` / regex, slug or URL generation, SEO meta / `<title>` / Open Graph / JSON-LD, analytics events, webhook or third-party payloads, cache keys, persisted writes, length checks — is wrapped in `stripStega()`. Values whose source field type is the dedicated DatoCMS `slug` field never carry stega and are exempt; for unknown provenance, default to wrapping. When debugging suspected leaks, use `revealStega()` to see the encoding (it's zero-width Unicode and invisible to `console.log`).

### Real-Time Updates

- The correct subscription primitive is used for the framework.
- Subscription options match the draft-aware query wrapper.
- Draft-only subscriptions stay draft-only when appropriate.
- React / Vue custom fetchers are defined outside reactive render scope.
- Astro uses page reload behavior through `<QueryListener />`, not live data hooks.

### Cache Tags

- The framework uses the correct raw query pattern for tags.
- Webhook auth is enforced.
- Tag extraction reads the Dato payload shape correctly.
- Invalidations target a concrete database, CDN, or purge adapter, or the missing provider choice is called out.

## Component Integrations

### Responsive Images

- GraphQL uses `responsiveImage` with `imgixParams: { auto: format }`.
- The component choice matches the framework and desired behavior.
- The query avoids redundant payload fields where possible.
- Astro imports use `@datocms/astro/Image`.

### Structured Text

- The query includes `value`, `links`, `blocks`, and `inlineBlocks` when custom rendering needs them.
- Every referenced record includes `id` and `__typename`.
- Renderer strategy matches the framework:
  - React uses renderers or node rules.
  - Vue uses `h()`-based renderers.
  - Svelte uses predicate-component tuples.
  - Astro uses `__typename`-keyed component maps.
- Content Link boundaries appear only on supported block or inline record components.

### Video

- The project installs the correct peer dependency for the framework.
- The query includes at least `muxPlaybackId`.
- Astro-only projects without React integration use a supported fallback instead of a nonexistent native player.

### SEO and Meta Tags

- Page-level SEO tags are combined with site favicon tags.
- The framework-specific helper is correct:
  - React: `renderMetaTags()`, `toNextMetadata()`, or `toRemixMeta()`
  - Vue: `toHead()`
  - Svelte: `<Head />`
  - Astro: `<Seo />`
- Astro imports use the correct subpath.

### Site Search

- React / Vue widget-based setups use `@datocms/cma-client-browser`.
- Svelte, Astro, and custom stacks use the low-level Search API pattern.
- `search_index_id` is always explicit.
- Browser code uses a least-privilege search token only.
- Missing index ids, tokens, or route wiring are called out clearly.

## Search and Crawl

### Robots and Sitemaps

- Dato crawler `Allow` rules appear before any catch-all `Disallow: /`.
- Sitemap output only contains URLs under the configured public site URL.
- Each public section has an explicit route builder and `lastmod` source.
- Suffix-specific Dato crawler groups are emitted only when they are actually needed.
