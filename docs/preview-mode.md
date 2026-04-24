# Preview Mode

**Head Start provides a preview mode to view content changes live, without the need for a new deployment.**

## Enable preview mode

To enable preview mode for a git branch, you must add it to [`config/preview.ts`](../config/preview.ts). Preview branches will deploy as `output: 'server'` rather than `output: 'hybrid'`, ignoring all `getStaticPaths()` and always rendering the page during run-time. The `preview` branch is configured as one of the preview branches and is automatically kept in sync with the `main` branch, so it can be used as preview equivalent, for example from the CMS.

> [!TIP]
> To enable preview mode during local development:
> - Make sure your current git branch is included in [`config/preview.ts`](../config/preview.ts).
> - Set `HEAD_START_PREVIEW_SECRET` and `DATOCMS_READONLY_API_TOKEN` in your local `.env`.
> - Enter preview mode via `/api/preview/enter/?secret=...` (or the preview login form).

To protect a part of the page that must only be available in preview mode, you can wrap it in the `PreviewModeProvider`, as is done in the [`Default.astro` layout](../src/layouts/Default.astro):

```astro
---
import PreviewModeProvider from '~/components/PreviewMode/PreviewModeProvider.astro';
---

<PreviewModeProvider>
  Content only available in preview mode
</PreviewModeProvider>
```

Note: all preview branches are automatically set to `noindex` to prevent them from turning up in any search results.

## Enter / exit preview mode

Preview mode is protected with a secret. If you attempt to view content protected with the `PreviewModeProvider` without having provided the secret, a form to enter the preview secret will be rendered instead. One way to enter the preview mode is by submitting that form with the preview secret. The other way is by calling the 'enter preview mode' API endpoint with the `secret` as query parameter. This endpoint has an additional `location` parameter to redirect the user to when authorised:

```bash
# by default 'enter preview' redirects to home page:
/api/preview/enter/?secret=my-little-secret

# you can use `location` to redirect to another page:
/api/preview/enter/?secret=my-little-secret&location=/en/some-page/
```

This endpoint is used by the CMS preview links (see [Preview links from the CMS](#preview-links-from-the-cms) below).

When authorised an encrypted cookie is set, to persist preview mode throughout a session. Calling the 'exit preview mode' endpoint removes the cookie and disables preview mode:

```bash
# by default 'exit preview' redirects to home page:
/api/preview/exit/

# you can use `location` to redirect to another page:
/api/preview/exit/?location=/en/some-page/
```

Note: the secret is configured as environment variable `HEAD_START_PREVIEW_SECRET`.

## Preview mode bar

When in preview mode a bar appears at the top of the page showing the connection status with DatoCMS, an edit mode toggle (for visual editing), and an exit link. The bar is rendered by [`PreviewMode.astro`](../src/components/PreviewMode/PreviewMode.astro) and included automatically in the [`Default.astro`](../src/layouts/Default.astro) layout.

Depending on the layout of your project you may want to move the bar to a different position - for example if your project has a sticky header the bar may overlap it. Adjust the positioning in `PreviewMode.astro`.

## Preview mode subscriptions

In preview mode the web page listens for content changes and automatically reloads to re-render on updates. To configure which content changes to listen to you can add one or more `PreviewModeSubscription` components, which accept the same `query` and `variables` properties you use to request the initial data:

```astro
---
import PreviewModeSubscription from '~/components/PreviewMode/PreviewModeSubscription.astro';
// ...
const variables = { locale, slug };
const { page } = await datocmsRequest<PageQuery>({ query, variables });
---

<PreviewModeSubscription
  query={query}
  variables={variables}
/>
<h1>{page.title}</h1>
```

## Preview links from the CMS

Head Start includes the [Model Deployment Links plugin](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-model-deployment-links) which adds preview links to the CMS sidebar. This allows editors to preview any page directly from the CMS, including draft (unpublished) content.

The plugin is configured automatically via migrations (see [`1750900000_previewLinks.ts`](../config/datocms/migrations/1750900000_previewLinks.ts)). It adds a "Preview" field to the Home, Page, and Not Found models with URL patterns for each.

### How it works

Each model has a different URL pattern:

| Model | URL pattern | How it resolves |
|---|---|---|
| Home | `/{ locale }/` | Direct link to the home page |
| Page | `/api/reroute/page/{ locale }/{ slug }` | Looks up the page by slug, 307 redirects to its canonical URL |
| Not found | `/{ locale }/404` | Direct link to the 404 page |

The **Page** model uses a reroute endpoint because the CMS only knows a page's slug, not its full nested path (e.g. a page with slug `my-page` might live at `/en/parent/my-page/`). The endpoint at `src/pages/api/reroute/page/[locale]/[slug].ts` queries DatoCMS for the page by slug and redirects to the correct canonical URL.

The sidebar links are shown for each Build Trigger configured in DatoCMS (e.g. Localhost, Preview, Production).

## Web Previews plugin

The [Web Previews plugin](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-web-previews) enables side-by-side editing in DatoCMS: editors see a live preview of the website alongside the editing panel. The plugin loads the website in an iframe, so editors can see their changes reflected in real-time.

### How it works

1. The plugin calls `/api/preview-links` to get the preview URL for the current record
2. It opens `/api/draft-mode/enable` to set the preview cookie in the iframe - this is a separate endpoint from `/api/preview/enter` because it needs to work cross-origin (the plugin iframe is served from `admin.datocms.com`, not your domain)
3. The iframe loads the preview URL with draft content visible

### Setup

The plugin is installed and configured automatically via the [`featVisualEditing`](../config/datocms/migrations/1776154900_featVisualEditing.ts) migration. The migration sets both URLs the plugin needs:

| Setting | Value written by the migration |
|---|---|
| **Preview Links API endpoint** | `{siteUrl}/api/preview-links?token={token}` |
| **Enable Draft Mode route** | `{siteUrl}/api/draft-mode/enable?token={token}` |

> [!WARNING]
> `siteUrl` is hardcoded in the migration to `https://preview.head-start.pages.dev` (the `preview` branch alias in this template). If your project uses a different domain, update the `siteUrl` constant in the migration **before** running it - otherwise the plugin will point at the wrong deployment.

`token` is read from `HEAD_START_PREVIEW_SECRET` at migration time. If the env var is set when you run the migration, the real secret is baked into the plugin config. If it isn't, the literal string `REPLACE_WITH_PREVIEW_SECRET` is written instead.

> [!NOTE]
> The site's Content-Security-Policy allows embedding in the plugin iframe via `frame-ancestors 'self' https://*.admin.datocms.com https://plugins-cdn.datocms.com` (see [`security-headers.ts`](../src/middleware/security-headers.ts)).

## Visual Editing

**Visual Editing** is the overlay that runs inside the Web Previews iframe - it lets CMS editors hover over the page and see which field produced each element, then click to jump straight to that field in DatoCMS. It is active **only in preview mode** (see [Enable preview mode](#enable-preview-mode)).

It relies on two mechanisms that always work together:

1. **Stega-encoded strings** - DatoCMS's GraphQL API injects invisible Unicode characters into every string returned in preview mode. Those markers encode the record id and field path. Rendered as text they are harmless, but used as a URL, `href`, phone number, or compared to an enum they break behavior. The `stripStega` helper removes them.
2. **`data-datocms-content-link-*` attributes** - HTML hints that tell the in-iframe overlay which DOM elements map to which content, so hovering highlights the right thing and clicking focuses the right field.

Both the helper and the attributes come from the [`@datocms/content-link`](https://github.com/datocms/content-link) library - refer to its README for up-to-date API reference.

### When to use `stripStega`

Import from the official package:

```ts
import { stripStega } from '@datocms/content-link';
```

Use it on any CMS string **whose value (not its displayed form) drives behavior**. 
Rule of thumb: if the string goes into an `href`, a `tel:`/`mailto:`, a `new URL()`, a built-in strict parser (e.g. `Intl.*`), a conditional comparison, an identifier whitelist check, a CSS class, a JSON key, or any API call - strip it. 
If the string is only rendered as visible text, leave it alone (stripping removes the markers that make click-to-edit work).

| Use case | Example | Reference |
|---|---|---|
| Link `href` | `const href = stripStega(rawHref);` | [`Link.astro`](../src/components/Link/Link.astro) |
| Enum / layout comparison | `const layout = stripStega(block.layout);` | [`GroupingBlock.astro`](../src/blocks/GroupingBlock/GroupingBlock.astro) |
| Style modifier (`primary` / `secondary`) | `if (stripStega(style) === 'primary') { ... }` | [`ActionBlock.astro`](../src/blocks/ActionBlock/ActionBlock.astro) |
| Phone / mailto value | `const phoneNumber = stripStega(rawPhoneNumber);` | [`PhoneLink.astro`](../src/blocks/ActionBlock/PhoneLink.astro), [`EmailLink.astro`](../src/blocks/ActionBlock/EmailLink.astro) |
| Image or video URL passed to Imgix/Mux | `const imageUrl = stripStega(image.url);` | [`Image.astro`](../src/blocks/ImageBlock/Image.astro) |
| Provider name in oEmbed lookup | `const providerName = stripStega(data?.provider_name);` | [`EmbedBlock.astro`](../src/blocks/EmbedBlock/EmbedBlock.astro) |

For a full list of usages in this codebase, search for `stripStega(`.

> [!WARNING]
> Do **not** wrap visible text in `stripStega`. You will disable click-to-edit for that field. `<h1>{page.title}</h1>` is correct; `<h1>{stripStega(page.title)}</h1>` is not.

### Content link attributes

#### How click-to-edit gets triggered

Before the attributes, the underlying mechanism:

1. The library scans the DOM for stega-encoded strings. It finds them in two places:
   - **Text content** - e.g. `<h1>{page.title}</h1>`, `<figcaption>{title}</figcaption>`
   - **Attribute values** - e.g. `<img alt={image.alt}>`, `<iframe title={title}>`, `aria-label={...}`
2. For each stega-encoded value it finds, the library stamps the surrounding element as clickable.
3. When you click a stamped element, the library walks up the DOM:
   - If it finds `data-datocms-content-link-group` → that group becomes the clickable target.
   - If it finds `data-datocms-content-link-boundary` → the walk stops and only the clicked element stays clickable.

So click-to-edit works automatically anywhere you render stega-encoded strings - no attributes required. The attributes below are only needed when the automatic detection misses an area you want clickable.

#### `data-datocms-content-link-source`

Attaches stega metadata to an element that doesn't otherwise have stega nearby. Use it on wrappers around **pure media** (images, videos, iframes) whose rendered content carries no stega strings.

```astro
<figure data-datocms-content-link-source={image.alt || image.title}>
  <img src={imageUrl} alt={altText} />
</figure>
```

The attribute **value** must itself be a stega-encoded string (pulled straight from the CMS field) - that's how the library knows which field to open. If the element already contains stega-carrying text or attributes in its subtree, `source` is redundant.

See [`VideoBlock.astro`](../src/blocks/VideoBlock/VideoBlock.astro) and [`EmbedBlock.astro`](../src/blocks/EmbedBlock/EmbedBlock.astro) for examples where `source` is required because the rendered media carries no stega on its own.

#### `data-datocms-content-link-group`

Marks a container whose direct children are a **list of sibling items** (blocks, structured-text children, etc.). Tells the overlay "these belong together" so arrow-key navigation and grouped highlighting work.

```astro
<div data-datocms-content-link-group>
  {blocks.map(block => <Block block={block} />)}
</div>
```

Used on the blocks wrapper in [`Blocks.astro`](../src/blocks/Blocks.astro) and around structured-text content in [`Text.astro`](../src/blocks/TextBlock/Text.astro).

#### `data-datocms-content-link-boundary`

Wraps **one child** inside a group to define the click region's edge. Use `style="display:contents"` so the wrapper does not affect CSS layout.

```astro
<div data-datocms-content-link-group>
  {blocks.map(block => (
    <div data-datocms-content-link-boundary style="display:contents">
      <Block block={block} />
    </div>
  ))}
</div>
```

See [`Blocks.astro`](../src/blocks/Blocks.astro).

#### How the three compose

```
┌─ data-datocms-content-link-group ──────────────┐
│  ┌─ boundary ────────────────────────────────┐ │
│  │  <BlockA>                                 │ │
│  │    <figure data-...-link-source="...">    │ │  ← one field inside this block
│  │  </BlockA>                                │ │
│  └───────────────────────────────────────────┘ │
│  ┌─ boundary ────────────────────────────────┐ │
│  │  <BlockB> ... </BlockB>                   │ │
│  └───────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

`group` = the list. `boundary` = one item in the list. `source` = one field inside the item.

### Checklist: adding a new block or component

When you add a new block or a component that renders CMS data directly:

- [ ] **Any string used as a URL, enum, class, or comparison?** → `stripStega(value)` it. (Strings only rendered as text: leave alone.)
- [ ] **Does the component render a single CMS field (image, video, embed, link)?** → Add `data-datocms-content-link-source={label}` on the outer element, where `label` is a recognizable value from the field (alt, title, URL - something the editor will see in the sidebar).
- [ ] **Does the component render a *list* of CMS items?** → Wrap in `data-datocms-content-link-group` and wrap each item in `data-datocms-content-link-boundary style="display:contents"`. Follow the pattern in [`Blocks.astro`](../src/blocks/Blocks.astro).
- [ ] **Rendering a non-text field (number, boolean) or a URL passed straight to a third-party component?** → The stega-encoded strings won't help here. Add `data-datocms-content-link-url={field._editingUrl}` on the element so the click-to-edit overlay still picks it up.
- [ ] **Only rendering prose / a single scalar value?** → Nothing to add. `Blocks.astro` already provides the group/boundary wrapping when your block is rendered as part of a page's blocks list.

### Debugging visual editing

- **Inspect the DOM.** Elements the library recognizes get a `data-datocms-contains-stega` attribute automatically. No attribute = no stega detected for that element.
- **See where a click will go.** Use `revealStega` from `@datocms/content-link` in a console log - it replaces invisible markers with visible `[STEGA:/editor/...]` tags so you can see the edit URL a value resolves to.

### Toggling the overlay on a preview page

When browsing a preview page **directly** (outside the DatoCMS iframe), the overlay's hover highlights and click-to-edit interception can get in the way of normal interaction. The preview bar includes an **edit mode: on/off** link that toggles the overlay via a `?ve=0` / `?ve=1` query parameter:

- Default (no `ve` param, or `ve=1`): overlay active.
- `?ve=0`: overlay disabled for that page view.

Inside the DatoCMS iframe the toggle is hidden automatically (the overlay is controlled by DatoCMS there, so the inline toggle would be redundant).
