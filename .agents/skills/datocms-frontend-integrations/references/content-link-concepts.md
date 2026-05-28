# Content Link Concepts

## Contents

- What Content Link Is
- How It Works
- Two Modes
- Query Function Changes
- `baseEditingUrl`
- `createController()` API
- Data Attributes Reference
- Group and Boundary Resolution Algorithm
- Structured Text Fields
- Stega Stripping Utilities
- Web Previews Visual Tab Integration
- Troubleshooting
- Environment Variables

## What Content Link Is

Content Link adds click-to-edit overlays for visual editing — editors click text on website to open its DatoCMS field.

## How It Works

CDA with `contentLink: 'v1'` embeds stega-encoded invisible Unicode metadata into text fields. `@datocms/content-link` library detects this in DOM, renders overlays that open the corresponding DatoCMS field on click.

## Two Modes

1. **Standalone** — when site is viewed directly in browser with draft content: overlays open DatoCMS field in new tab
2. **Within Web Previews Visual tab** — site loaded in DatoCMS Visual editing plugin iframe: overlays open field in side panel via Penpal

## Query Function Changes

When `includeDrafts` is true, add these options:

```ts
const result = await executeQuery(query, {
  // ... other options
  contentLink: options?.includeDrafts ? 'v1' : undefined,
  baseEditingUrl: options?.includeDrafts ? BASE_EDITING_URL : undefined,
});
```

**Only enable `contentLink` for draft** — stega encoding adds invisible characters inappropriate in production (breaks string matching, SEO, text processing).

## `baseEditingUrl`

Your DatoCMS project editor URL: **DatoCMS → Settings → Environment settings**. Format: `https://{project-slug}.admin.datocms.com/environments/{environment-name}`. Store as env var (e.g., `DATOCMS_BASE_EDITING_URL`).

## `createController()` API

Main entry point for client-side Content Link — sets up DOM scanning, mutation observation, click-to-edit overlays.

### Import

```ts
import { createController } from '@datocms/content-link';
```

### Options

```ts
const controller = createController({
  root: document.getElementById('preview-container'),
  stripStega: false,
  onNavigateTo: (path) => { router.push(path); },
});
```

- **`root?: ParentNode`** — limit scanning to this container (default: `document`)
- **`stripStega?: boolean`** — strip invisible stega characters from text after stamping (default: `false`)
- **`onNavigateTo?: (path: string) => void`** — callback when Web Previews plugin requests navigation

### Controller Methods

- **`enableClickToEdit(flashAll?)`** — turn overlays on. Pass `{ scrollToNearestTarget: true }` to flash all editables and scroll to nearest
- **`disableClickToEdit()`** — turn overlays off (DOM stamping continues)
- **`isClickToEditEnabled()`** — returns `true` if click-to-edit active
- **`flashAll(scrollToNearestTarget?)`** — highlight all editable elements. Pass `true` to scroll to nearest if none visible
- **`setCurrentPath(path)`** — notify Web Previews plugin of current URL (for client-side routing)
- **`dispose()`** — permanently disconnect observers. Cannot re-enable; create new controller
- **`isDisposed()`** — returns `true` if disposed

### Keyboard Shortcut

Hold **Alt/Option** to temporarily toggle click-to-edit mode (works regardless of `enableClickToEdit()` state).

### SSR Safety

`createController()` is safe in server environments — returns no-op controller. No `typeof window` checks needed, but only render ContentLink in draft mode.

### DOM Stamping Note

DOM stamping runs automatically on creation and continues via `MutationObserver` until `dispose()`. Overlays are independent — explicitly enable with `enableClickToEdit()`.

## Data Attributes Reference

### Developer-Specified Attributes

#### `data-datocms-content-link-url`

Manually mark element as editable with explicit edit URL. Use for **non-text fields** (numbers, booleans, dates, JSON) that can't contain stega. Query `_editingUrl` meta field:

```graphql
query {
  product {
    id
    name
    price
    isActive
    _editingUrl
  }
}
```

```tsx
<span data-datocms-content-link-url={product._editingUrl}>
  ${product.price}
</span>

<span data-datocms-content-link-url={product._editingUrl}>
  {product.isActive ? 'Active' : 'Inactive'}
</span>
```

`_editingUrl` available on all records, returns full URL to edit that record in DatoCMS.

#### `data-datocms-content-link-source`

Attach stega metadata without rendering visible content. Use for **structural elements that can't contain text** (`<video>`, `<audio>`, `<iframe>`) or when visible stega is problematic:

```tsx
<div data-datocms-content-link-source={video.alt}>
  <video src={video.url} poster={video.posterImage.url} controls />
</div>
```

Value must be stega-encoded string (any text field from API works). Library decodes metadata and makes element clickable.

#### `data-datocms-content-link-group`

Expand clickable area to parent element. Default: immediate parent of text node is clickable. Adding this to ancestor makes that ancestor the clickable target instead:

```html
<article data-datocms-content-link-group>
  <h2>Title with stega</h2>
  <p>Description with no stega</p>
</article>
```

Clicking anywhere in `<article>` opens editor. **Group should contain only one stega source** — multiple resolving to same group logs collision warning, last URL wins.

#### `data-datocms-content-link-boundary`

Stop upward DOM traversal for `data-datocms-content-link-group`, making element with stega the clickable target instead. Creates independent editable region that won't merge into parent:

```html
<div data-datocms-content-link-group>
  <h1>Title with stega (URL A)</h1>
  <section data-datocms-content-link-boundary>
    <span>Text with stega (URL B)</span>
  </section>
</div>
```

Without boundary: clicking "Text with stega" opens URL A (outer group). With boundary: `<span>` becomes clickable opening URL B.

Boundary can be on element containing stega:

```html
<div data-datocms-content-link-group>
  <h1>Title with stega (URL A)</h1>
  <span data-datocms-content-link-boundary>Text with stega (URL B)</span>
</div>
```

### Library-Managed Attributes

Added automatically during DOM stamping. Target in CSS.

#### `data-datocms-contains-stega`

Added to elements whose text content contains stega characters. Only present when `stripStega` is `false` (default). Use for CSS workarounds — zero-width chars often cause unexpected letter-spacing!

```css
[data-datocms-contains-stega] {
  letter-spacing: 0 !important;
}
```

#### `data-datocms-auto-content-link-url`

Added automatically to elements library identifies as editable targets (through stega decoding and group/boundary resolution). Contains resolved edit URL. Automatic counterpart to developer-specified `data-datocms-content-link-url`.

## Group and Boundary Resolution Algorithm

When library encounters stega content inside element, walks up DOM tree:

1. Finds `data-datocms-content-link-group` → stamps **that group element** as clickable target
2. Finds `data-datocms-content-link-boundary` → stamps **starting element** as clickable target, stops traversal
3. Reaches root without finding either → stamps **starting element**

### Example 1: Nested groups

```html
<div data-datocms-content-link-group>
  <h1>Title with stega (URL A)</h1>
  <div data-datocms-content-link-group>
    <p>Paragraph with stega (URL B)</p>
  </div>
</div>
```

- "Title with stega": walks from `<h1>`, finds outer group → **outer `<div>`** clickable (opens URL A)
- "Paragraph with stega": walks from `<p>`, finds inner group first → **inner `<div>`** clickable (opens URL B)

### Example 2: Boundary preventing group propagation

```html
<div data-datocms-content-link-group>
  <h1>Title with stega (URL A)</h1>
  <section data-datocms-content-link-boundary>
    <span>Text with stega (URL B)</span>
  </section>
</div>
```

- "Title with stega": walks from `<h1>`, finds outer group → **outer `<div>`** clickable (URL A)
- "Text with stega": walks from `<span>`, hits `<section>` boundary → stops, **`<span>`** clickable (URL B)

### Example 3: Boundary inside group

```html
<div data-datocms-content-link-group>
  <p>Main content with stega (URL A)</p>
  <div data-datocms-content-link-boundary>
    <p>Isolated content with stega (URL B)</p>
  </div>
</div>
```

- "Main content": walks from `<p>`, finds outer group → **outer `<div>`** clickable (URL A)
- "Isolated content": walks from inner `<p>`, hits boundary → stops, **inner `<p>`** clickable (URL B)

### Example 4: Multiple stega strings without separation (collision warning)

```html
<p>
  Text with stega (URL A)
  More text with stega (URL B)
</p>
```

Both resolve to same `<p>`. Library logs warning, last URL wins. Fix by wrapping each piece:

```html
<p>
  <span>Text with stega (URL A)</span>
  <span>More text with stega (URL B)</span>
</p>
```

## Structured Text Fields

Special attention needed for them! API encodes stega only in the **last text span** of the document (one marker per field) — without config, only that tiny span is clickable. Structured Text can contain **embedded blocks** and **inline records**, each with own editing URL.

### Rule 1: Always wrap Structured Text component in group

Makes entire structured text area clickable, not just tiny stega span:

```tsx
<div data-datocms-content-link-group>
  <StructuredText data={page.content} />
</div>
```

### Rule 2: Wrap embedded blocks and inline records in boundary

Embedded blocks and inline records have own edit URL. Without boundary, clicking them bubbles to parent group and opens structured text field editor instead. Add `data-datocms-content-link-boundary`:

```tsx
<div data-datocms-content-link-group>
  <StructuredText
    data={page.content}
    renderBlock={({ record }) => (
      <div data-datocms-content-link-boundary>
        <BlockComponent block={record} />
      </div>
    )}
    renderInlineRecord={({ record }) => (
      <span data-datocms-content-link-boundary>
        <InlineRecordComponent record={record} />
      </span>
    )}
    renderLinkToRecord={({ record, children, transformedMeta }) => (
      <a {...transformedMeta} href={`/posts/${record.slug}`}>
        {children}
      </a>
    )}
  />
</div>
```

### Why `renderLinkToRecord` does NOT need boundary

Record links are anchors wrapping text belonging to structured text field. Text inside carries structured text field's stega encoding, so clicking link text opens structured text field editor — correct. Only blocks and inline records have own separate editing URL.

### Result

- Clicking main text → opens **structured text field editor**
- Clicking embedded block → opens **that block's editor**
- Clicking inline record → opens **that inline record's editor**
- Clicking record link → opens **structured text field editor** (correct, link text is part of field)

## Stega Stripping Utilities

`@datocms/content-link` exports three utilities: `stripStega` (clean), `decodeStega` (inspect), `revealStega` (debug).

Stega leakage into application logic is THE most common visual-editing bug source, PLUS invisible encoding means `console.log` and visual inspection lie. These utilities help debug what's invisible.

### Import

```ts
import { stripStega, decodeStega, revealStega } from '@datocms/content-link';
```

### `stripStega(input)`

Removes all stega invisible characters. Works on strings, objects, arrays, nested structures. Internally converts to JSON, removes via regex, parses back:

```ts
const clean = stripStega("Hello with invisible stega chars");
const cleanObj = stripStega({ name: "John with stega", age: 30 });
const cleanData = stripStega({
  users: [
    { name: "Alice with stega", email: "alice@example.com with stega" },
  ]
});
```

### `decodeStega(input)`

Extracts editing metadata from single stega-encoded string. Returns `{ origin: string, href: string }` if stega found, `null` otherwise:

```ts
const info = decodeStega(someTextField);
// Returns: { origin: 'datocms', href: 'https://my-project.admin.datocms.com/...' } or null
```

### `revealStega(input)` — debugging

Works on any data type — preserves input shape: strings stay strings, objects/arrays keep structure. Rewrites encoding from invisible Unicode into visible **`[STEGA:/editor/item_types/…]`** marker. Reach for when stega-related breaks mysteriously — `console.log` shows nothing (zero-width Unicode), but `revealStega` makes it inspectable:

```ts
console.log(revealStega(page.title));
// "Hello World[STEGA:/editor/item_types/123/items/456]"

console.log(revealStega(graphqlResponse));
// {
//   blog: {
//     title: "Hello World[STEGA:/editor/item_types/123/items/456]",
//     author: { name: "Alice[STEGA:/editor/item_types/789/items/012]" }
//   }
// }
```

Use it to answer questions like: _is this field stega-encoded?_, _which fields carry editing metadata?_, _why is my equality check silently failing?_

### When to Strip Stega

General rule: stega-encoded values safe to render directly into text/HTML (invisible characters survive intact, power click-to-edit overlay), but **not safe to use in any other code path**. If value crosses out of "render this as final content" into _any_ other use, wrap in `stripStega()`.

Non-render uses:

- **String comparisons** — `record.slug === 'about'`, `value.includes('foo')`, `switch (status)`. Invisible chars are part of string, equality silently fails
- **`split` / `replace` / regex** — manipulating string
- **JSON to external systems** — analytics, third-party APIs, webhooks, structured logs. Invisible bytes survive serialization
- **SEO, `<meta>`, `<title>`, Open Graph, JSON-LD** — search engines and social previews see raw bytes
- **URL/href generation from stega-carrying text** — slug-like values built from `title`/text fields. DatoCMS `slug` field type itself never carries stega — no strip needed (see field-type exception below)
- **Analytics / tracking** — event names and properties should be clean
- **`length` / `textContent` length checks** — stega inflates length
- **Anything to database, cache key, persisted store**

```tsx
// Render: safe as-is
<h1>{page.title}</h1>

// Slug field: never carries stega, use directly
<Link href={`/blog/${page.slug}`}>...</Link>

// Comparison on stega-carrying field: must strip
if (stripStega(page.title) === 'Home') { ... }

// SEO: must strip
<meta name="description" content={stripStega(page.seoDescription)} />

// Analytics: must strip
analytics.track('viewed_post', { title: stripStega(post.title) });
```

#### Field-type exception: which fields actually carry stega

CDA only embeds stega into specific field types — not all text. Source type tells you whether `stripStega()` needed.

**Record fields that carry stega:**

- Single-line string — skipped if Format validator (URL, email, regex) set
- Multi-paragraph text (raw + markdown-rendered) — skipped if Format validator set
- Structured text — only **last text span** of document annotated (one marker per field)

**Record fields that never carry stega:** Slug, JSON, Boolean, Integer, Float, Date, DateTime, Color, Lat/Lon, SEO, Video, File, Gallery, Link, Links, Modular content, Single block.

So in `{ blogPost { title, body, intro, slug } }`, stega added to `title`, `body`, `intro` — not `slug`.

**Upload (asset) fields:**

- `alt` carries stega (whether queried standalone via `upload`/`allUploads`, or via record's `file`/`gallery` field), and `responsiveImage.alt` too
- `title`, `url`, `filename`, `customData`, `tags`, etc. — never carry stega

For known-clean source (slug, SEO, dates, upload `url`, etc.), `stripStega` is no-op at best, noisy at worst. For values of unclear origin (variable several calls deep, props of unknown provenance, generic helpers), default to `stripStega()` — cheap idempotent op, cost of missed wrap is silent breakage.

#### Debugging suspected leaks

When something string-related behaves strangely on draft but works on published, suspect stega. Diagnostic loop:

1. `console.log(revealStega(value))` to see if stega present and where (works on strings, objects, full responses — shape preserved, encoding visible as `[STEGA:...]`)
2. If yes, trace where value enters non-render logic, add `stripStega()` at that boundary
3. Consider whether field source is DatoCMS `slug` field — if so, leak is upstream (somebody else's text field bleeding) rather than at this site

### CSS Alternative (Layout Fix Only)

If only problem is layout issues from stega chars (unexpected letter-spacing), use CSS instead:

```css
[data-datocms-contains-stega] {
  letter-spacing: 0 !important;
}
```

Fixes visual rendering without removing stega encoding, click-to-edit continues to work.

### Controller `stripStega` Option vs `stripStega()` Utility

Different mechanisms:

- **`stripStega()` utility** — returns clean copy. Does not modify original data or DOM. Use for one-off cleaning (SEO tags, comparisons, analytics)
- **`createController({ stripStega: true })`** — permanently mutates DOM text nodes to remove stega after stamping. All `textContent` becomes clean, but new controller on same page won't detect elements (encoding lost). Use `false` (default) if need to dispose and recreate controllers without page reload

## Web Previews Visual Tab Integration

When frontend runs inside Visual Editing tab of Web Previews plugin, Content Link automatically establishes bidirectional communication via Penpal. No explicit config — library detects iframe context automatically. Connection attempt has 20-second timeout; fails silently, falls back to standalone mode.

### Behavior Differences in Visual Tab

- **Clicks open fields in side panel** instead of new browser tab
- **Bidirectional routing** supported: plugin can request navigation (`onNavigateTo`), website can notify plugin of route changes (`setCurrentPath`)

### Client-Side Routing Support

If site uses client-side routing (Next.js, Nuxt, SvelteKit, etc.), set up bidirectional routing:

1. **Plugin → Website** — pass `onNavigateTo` to `createController()`. Plugin calls this when navigating to different record
2. **Website → Plugin** — call `controller.setCurrentPath(path)` when route changes. Plugin updates internal state

See framework-specific reference files for complete routing examples.

### CSP Requirement

For Visual tab to load frontend in iframe, site must allow being embedded by DatoCMS plugin origin. Add CSP header:

```
Content-Security-Policy: frame-ancestors 'self' https://plugins-cdn.datocms.com
```

Framework-specific CSP setup in each framework reference file.

### Draft Mode URL Plugin Setting

In Web Previews plugin configuration, **"Draft mode URL"** setting specifies URL that auto-enables draft mode when Visual tab loads. Typically enable endpoint (e.g., `https://your-site.com/api/draft-mode/enable?token=YOUR_SECRET`). Without this, Visual tab loads site without draft mode, Content Link won't have stega data.

### Graceful Fallback

If site not running inside Web Previews plugin iframe (opened directly in browser), Content Link falls back to opening edit URLs in new tab. Automatic, no code changes.

## Troubleshooting

- **No overlays appear**: ensure query function includes both `contentLink: 'v1'` and `baseEditingUrl` when `includeDrafts` true. Verify `enableClickToEdit()` called on controller
- **Layout issues from stega encoding**: invisible chars cause unexpected letter-spacing/overflow. Fix with CSS: `[data-datocms-contains-stega] { letter-spacing: 0 !important; }`. Alternatively, `createController({ stripStega: true })` to permanently remove from DOM
- **Strings broken by invisible characters**: use `stripStega()` before string comparisons, search ops, SEO metadata, analytics, any programmatic text processing. Import from `@datocms/content-link`. See "When to Strip Stega" for full non-render list
- **Equality check silently fails on draft / works on published**: classic stega leak. Line like `if (page.title === 'Home')` is `false` in draft mode because `page.title` carries invisible stega chars. Confirm with `console.log(revealStega(page))` — if value shows `[STEGA:...]` markers, wrap comparison in `stripStega()`. (Note: actual DatoCMS `slug` field type never carries stega, nor do non-text types — see "Field-type exception" for full list. If a known-clean field shows stega, file bug)
- **`console.log` shows value looks normal but code disagrees**: stega chars are zero-width Unicode. `console.log` and browser dev tools render invisibly, value _looks_ identical to literal while actually different. Use `revealStega(value)` to reveal encoding, or check `value.length` against literal's length
- **Invisible characters reaching analytics, third-party APIs, persisted stores**: any value going outside render path (analytics event props, webhook payloads, cache keys, DB writes, `<meta>` content) must be stripped first. Treat boundary at point value leaves render layer
- **Wrong element highlighted (too small click target)**: use `data-datocms-content-link-group` on parent element to expand clickable area. Especially important for Structured Text fields where stega span is tiny
- **Structured text clicks open wrong editor**: embedded blocks and inline records need `data-datocms-content-link-boundary` to prevent clicks bubbling to parent group. See Structured Text Fields section
- **Controller recreation fails after disposal**: only works when `stripStega` is `false` (default). If used `stripStega: true`, stega encoding permanently removed. Reload page or re-fetch content to restore
- **Multiple stega strings on same element (collision warning)**: when two stega strings resolve to same clickable target, last URL wins. Fix by wrapping each piece in own element, or use `data-datocms-content-link-group`/`data-datocms-content-link-boundary` to separate
- **Web Previews Visual tab not connecting**: plugin connection only works when site loaded inside Web Previews plugin iframe. Outside plugin, edit URLs open in new tab as graceful fallback. Ensure CSP header allows `frame-ancestors 'self' https://plugins-cdn.datocms.com`
- **Visual tab loads but no stega data**: check Web Previews plugin's "Draft mode URL" setting configured. Without it, Visual tab loads site without draft mode, CDA returns text without stega encoding
- **Non-text field not clickable**: non-text fields (numbers, booleans, dates, JSON) cannot contain stega encoding. Use `data-datocms-content-link-url` with record's `_editingUrl` field from GraphQL API

## Environment Variables

| Variable | Description | Where to find it |
| - | - | - |
| Base Editing URL | DatoCMS editor URL for Content Link | DatoCMS → Settings → Environment settings |

Framework-specific variable names in each framework reference file.
