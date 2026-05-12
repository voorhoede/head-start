# Web Previews Concepts

DatoCMS Web Previews plugin integration reference.

## Contents

- What the Web Previews Plugin Is
- Plugin Configuration
- Preview-Links Endpoint Contract
- CORS Requirements
- `recordToWebsiteRoute` Pattern
- `reloadPreviewOnRecordUpdate`
- Visual Editing Tab and Content Link
- CSP Requirements
- Plugin Installation Steps
- Dependencies

## What the Web Previews Plugin Is

[Web Previews](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-web-previews) adds three DatoCMS editor features:

1. **Sidebar preview links** — Clickable record sidebar links for draft/published frontend versions
2. **Sidebar iframe preview** — Inline record preview iframe
3. **Visual editing tab** — Full-screen tab with frontend iframe for Content Link overlays

All need a **preview-links endpoint** that maps records to URLs.

## Plugin Configuration

Web Previews plugin configures one or more "frontends". Each needs:

- **Preview webhook URL** — Preview-links endpoint URL (e.g., `https://your-site.com/api/preview-links?token=YOUR_SECRET`)
- **Draft mode URL** — Auto-enables draft mode when Visual editing tab loads (typically your enable endpoint, e.g., `https://your-site.com/api/draft-mode/enable?token=YOUR_SECRET`). **Required for Visual editing with Content Link** — without it, Visual tab loads without draft mode, so CDA returns text without stega encoding and Content Link overlays won't appear.
- **Initial path** — Optional default path when Visual editing tab opens (defaults to `/`)
- **Custom headers** — Optional HTTP headers sent to preview-links endpoint
- **Viewport presets** — Optional iframe preview sizes (sidebar and Visual tab)
- **Iframe `allow` attribute** — Optional iframe permissions (microphone, camera). See [MDN iframe allow](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#allow).

## Preview-Links Endpoint Contract

Preview-links endpoint receives POST requests from DatoCMS editor and returns record preview URLs.

### Request Body

```ts
type WebPreviewsRequestBody = {
  item: RawApiTypes.Item;        // The record (raw JSON:API format)
  itemType: ApiTypes.ItemType;   // The model (includes id and attributes.api_key)
  currentUser: object;           // The logged-in DatoCMS user
  siteId: string;                // The DatoCMS project ID
  environmentId: string;         // The environment ID
  locale: string;                // The current locale in the editor
};
```

### Response Format

```ts
type PreviewLink = {
  label: string;
  url: string;
  reloadPreviewOnRecordUpdate?: boolean | { delayInMs: number };
};

type WebPreviewsResponse = {
  previewLinks: PreviewLink[];
};
```

### Status Branching Logic

Endpoint branches on `item.meta.status`:

- **`status !== 'published'`** — Record has draft version. Generate URL that enables draft mode then redirects to content page.
- **`status !== 'draft'`** — Record has published version. Generate URL that disables draft mode then redirects to content page.
- Both states can exist simultaneously (published with unpublished changes), so both links may be returned.

```ts
const response: WebPreviewsResponse = { previewLinks: [] };

if (url) {
  if (item.meta.status !== 'published') {
    response.previewLinks.push({
      label: 'Draft version',
      url: new URL(
        `/api/draft-mode/enable?redirect=${url}&token=${token}`,
        requestUrl,
      ).toString(),
    });
  }

  if (item.meta.status !== 'draft') {
    response.previewLinks.push({
      label: 'Published version',
      url: new URL(
        `/api/draft-mode/disable?redirect=${url}`,
        requestUrl,
      ).toString(),
    });
  }
}
```

**Note:** Nuxt uses `url` instead of `redirect`. Check framework-specific reference for exact parameter names.

### Endpoint Error Behavior

- **Non-200 status** — Plugin logs "returned a {status} status" and shows no preview links
- **Invalid JSON or wrong structure** — Plugin logs "returned an invalid payload"
- **Empty `{ previewLinks: [] }`** — Normal for records without frontend URLs (settings singletons, reusable blocks)
- Always return 200 with empty `previewLinks` array for unmatched records, not error status

## CORS Requirements

Preview-links endpoint receives POST requests from DatoCMS editor (different origin). Needs CORS headers:

```ts
function withCORS(responseInit?: ResponseInit): ResponseInit {
  return {
    ...responseInit,
    headers: {
      ...responseInit?.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  };
}
```

Handle `OPTIONS` preflight:

```ts
export async function OPTIONS() {
  return new Response('OK', withCORS());
}
```

**Nuxt exception:** Handles CORS via `routeRules` in `nuxt.config.ts`:

```ts
routeRules: {
  '/api/**': { cors: true },
}
```

## `recordToWebsiteRoute` Pattern

Maps DatoCMS record to frontend URL. Used by preview-links endpoint.

Pattern varies by framework:

- **Next.js** — Switches on `item.__itemTypeId` (deserialized item's model ID). Uses `deserializeRawItem` from `@datocms/rest-client-utils` to convert raw item.
- **Nuxt, SvelteKit** — Switches on `itemTypeId` parameter (from `itemType.id` in request body)
- **Astro** — Switches on `itemType.attributes.api_key` (model's API key string, e.g., `'blog_post'`)

Skeleton:

```ts
function recordToWebsiteRoute(item, itemTypeIdentifier, locale) {
  switch (itemTypeIdentifier) {
    case 'YOUR_MODEL_ID_OR_API_KEY': {
      return `/your-path/${item.attributes.slug}`;
    }
    // Add more cases for each content model
    default:
      return null;
  }
}
```

User must fill in their own models. Provide TODO comments showing examples.

## `reloadPreviewOnRecordUpdate`

Each preview link can specify `reloadPreviewOnRecordUpdate` to control iframe refresh behavior when editor saves record:

- `true` — Reloads after 100ms delay
- `{ delayInMs: N }` — Reloads after custom delay in milliseconds

Triggered when record's version changes (on save). Delay useful for frameworks needing rebuild/revalidate time before preview reflects changes (e.g., Next.js ISR revalidation).

**Note:** Cross-origin iframe restrictions prevent maintaining scroll position between reloads — page reloads from top.

## Visual Editing Tab and Content Link

Visual editing tab loads your frontend in full-screen DatoCMS iframe. With Content Link, enables visual editing where editors click elements to open corresponding fields in side panel.

### How It Works

1. Plugin loads your frontend URL in iframe (uses "Draft mode URL" setting to auto-enable draft mode)
2. `@datocms/content-link` library detects iframe context and establishes Penpal connection with plugin — **automatic, no configuration needed**
3. When editor clicks element with Content Link overlay, click communicated to plugin which opens field in side panel (not new tab)
4. **Bidirectional routing** keeps plugin and website in sync:
   - Plugin → Website: When editor navigates to different record, plugin calls `onNavigateTo` (passed to `createController()`)
   - Website → Plugin: When client-side navigation occurs, call `controller.setCurrentPath(path)` to notify plugin

### Graceful Fallback

If frontend not running inside plugin iframe (e.g., opened directly in browser), Content Link falls back to opening edit URLs in new browser tabs. No code changes needed.

See `content-link-concepts.md` for full Content Link documentation including `createController()` API, data attributes, structured text patterns, troubleshooting.

## CSP Requirements

For iframe preview and Visual editing tab to work, frontend must allow being embedded by DatoCMS plugin iframe. Add Content-Security-Policy header:

```
frame-ancestors 'self' https://plugins-cdn.datocms.com
```

## Plugin Installation Steps

1. DatoCMS → Settings → Plugins → Add new
2. Search "Web Previews" in marketplace
3. Install plugin
4. Configure frontend:
   - Set preview webhook URL to preview-links endpoint (e.g., `https://your-site.com/api/preview-links?token=YOUR_SECRET_API_TOKEN`)
   - If using Visual editing: set "Draft mode URL" to enable endpoint (e.g., `https://your-site.com/api/draft-mode/enable?token=YOUR_SECRET_API_TOKEN`)
   - Optionally set initial path, viewport presets, iframe allow attributes

## Dependencies

Preview-links endpoint requires:

- `@datocms/cma-client` — For `RawApiTypes.Item` and `ApiTypes.ItemType` types, and `ApiError` for error handling
- `@datocms/rest-client-utils` — **Next.js only**, for `deserializeRawItem` to convert raw JSON:API item before passing to `recordToWebsiteRoute`
