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

## Web Previews plugin

The [Web Previews plugin](https://www.datocms.com/marketplace/plugins/i/datocms-plugin-web-previews) enables side-by-side editing in DatoCMS: editors see a live preview of the website alongside the editing panel. The plugin loads the website in an iframe, so editors can see their changes reflected in real-time.

### How it works

1. The plugin calls `/api/preview-links` to get the preview URL for the current record
2. It opens `/api/draft-mode/enable` to set the preview cookie in the iframe
3. The iframe loads the preview URL with draft content visible

### Setup

The plugin is installed and configured automatically via the [`featVisualEditing`](../config/datocms/migrations/1776154900_featVisualEditing.ts) migration. The migration sets both URLs the plugin needs:

| Setting | Value written by the migration |
|---|---|
| **Preview Links API endpoint** | `{siteUrl}/api/preview-links?token={token}` |
| **Enable Draft Mode route** | `{siteUrl}/api/draft-mode/enable?token={token}` |

`siteUrl` is hardcoded in the migration to the deployment that hosts visual editing (the `preview` branch alias - `https://preview.head-start.pages.dev` in this template). If your project uses a different domain, change the `siteUrl` constant in the migration before running it.

`token` is read from `HEAD_START_PREVIEW_SECRET` at migration time. If the env var is set when you run the migration, the real secret is baked into the plugin config. If it isn't, the literal string `REPLACE_WITH_PREVIEW_SECRET` is written instead.

> [!NOTE]
> The site's Content-Security-Policy allows embedding in the plugin iframe via `frame-ancestors 'self' https://*.admin.datocms.com https://plugins-cdn.datocms.com` (see [`security-headers.ts`](../src/middleware/security-headers.ts)).

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
  record={{ type: page.__typename, id: page.id }}
/>
<h1>{page.title}</h1>
```

The `record` prop is used to generate the "edit in CMS" link in the preview bar and to make block labels clickable (so they open the block’s field in DatoCMS).

## Preview mode bar

When in preview mode a bar in the user interface displays the status of the connection with the CMS, along with a link to exit preview mode. Depending on the layout of your project, you may want to move the preview mode bar to another position, for example if your project has a sticky header.

## Edit in CMS link

In preview mode, the preview bar shows an **"edit in CMS"** link that opens the record in DatoCMS.

### How it works

The link is automatically generated from the `record` prop passed to `PreviewModeSubscription`. The URL is built from:
- **Project name**: extracted from `internalDomain` in `~/lib/site.json`
- **Environment**: from `datocms-environment.ts`
- **Record info**: `id` + `type` (from `record` prop) → resolved to `itemTypeId` via auto-generated mappings

If any part can't be resolved, the link doesn't render.

### Usage

Pass the `record` prop to `PreviewModeSubscription`:

```astro
<PreviewModeSubscription
  query={query}
  variables={variables}
  record={{ type: page.__typename, id: page.id }}
/>
```

Your GraphQL query needs:

```graphql
query MyPage {
  page {
    id
    __typename
    # ... other fields
  }
}
```

### Auto-generated files

- `src/lib/datocms/itemTypes.json` — `itemTypes[__typename]` with `id`, `name`, `focusField` (generated, in `.gitignore`)

When DatoCMS models change, regenerate:

```bash
npm run prep:download-item-types
```

## Block field path detection

When clicking on a block label in preview mode, the system automatically generates a field path to focus the correct field in DatoCMS. This uses the [DatoCMS content link](https://www.datocms.com/docs/content-link/how-to-use-content-link) feature, which allows linking directly to a specific field in the editor via a URL hash. Block labels are only clickable when `PreviewModeSubscription` receives a `record` prop (see above). This is done by detecting the "focus field" for each block type.

### How it works

The focus field is automatically detected based on field types:
- **Rich/structured text fields** (primary content)
- **Media fields** (file, video, image)
- **JSON fields** (structured data like tables)
- **Link fields** (with validators)
- **URL text fields**

**Metadata fields are excluded** (e.g., `title`, `layout`, `style`, `slug`, `id`) since they're configuration rather than editable content.

The script finds the first field matching these criteria (excluding metadata) and uses it as the focus field. Results are written to `itemTypes.json` (id, name, focusField per block type). `Blocks.astro` reads that and builds the path; blocks that render nested `<Blocks />` (e.g. GroupingBlock) must pass an `editorFieldPath` that matches the schema path to the nested list.

### Field path format

Paths use **DatoCMS API keys** (snake_case), not GraphQL field names.

**How we build the path:**

1. **Script** ([`scripts/download-item-types.ts`](../scripts/download-item-types.ts)): For each block type, picks one focus field (or uses `focusFieldOverrides`) and writes it to `itemTypes.json`. Block types with no matching field get no `focusField`; the path then stops at the block index.
2. **Blocks.astro**: Receives `editorFieldPath` (default `bodyBlocks`). Converts the first segment to API key with `toApiKey` (camelCase → snake_case, e.g. `bodyBlocks` → `body_blocks`). For each block at index `i`, `blockBasePath = apiKeyPath.i`; the label path is `blockBasePath` + optional `.focusField` from itemTypes. Passes `editorFieldPath={blockBasePath}` into the block (so nested blocks know their parent path).
3. **Blocks with nested Blocks** (e.g. GroupingBlock): Receive `editorFieldPath` = parent's `blockBasePath` (e.g. `body_blocks.2`). They must append the schema path to the nested blocks array and pass that to `<Blocks />`. GroupingBlock does `editorFieldPath.items.{itemIndex}.blocks` (see `buildNestedFieldPath` in [`block-editor-utils.ts`](../src/blocks/block-editor-utils.ts)). Any other block that renders nested `<Blocks />` should follow the same idea so paths match the record structure in DatoCMS.

**Examples:**

| Context | Path (`data-editor-field-path`) |
|--------|---------------------------|
| First block on page, TableBlock (focus `table`) | `body_blocks.0.table` |
| Second block, TextBlock (focus `body`) | `body_blocks.1.body` |
| Block with no focus field | `body_blocks.0` |
| Third block (e.g. TextBlock) inside first item of GroupingBlock at page index 2 | `body_blocks.2.items.0.blocks.2.body` |

The client injects the current locale (from `<html lang="...">`) after the root field when building the hash—e.g. `body_blocks.0.table` → `body_blocks.en.0.table`—so DatoCMS focuses the field in the correct locale.

**Specific cases:**

- **GroupingBlock**: Builds nested path as `{parentBasePath}.items.{itemIndex}.blocks`. Forwards `hideEditorLabels` to nested `<Blocks />`.


### Hiding editor labels (hideEditorLabels)

Pass `hideEditorLabels` on `<Blocks />` (or on a block that forwards it, e.g. `GroupingBlock`) when you do not want to render block labels in that subtree.

- **PagePartialBlock children**: Blocks belong to the partial record, not the main page. Labels would open the wrong record in the editor.
- **TextBlock inline blocks** (`src/blocks/TextBlock/nodes/Block.astro`): Blocks are embedded in rich text. Labels would open the wrong field or add clutter.

### Adding a new block

When you add a new block type, the focus field is automatically detected when you run:

```bash
npm run prep:download-item-types
```

The script will:
1. Find the first field matching the criteria above
2. Use it as the focus field for that block type
3. Write the focus field to `itemTypes.json` (the locale and full path are resolved at runtime by `Blocks.astro` and the client)

### Manual override

If automatic detection picks the wrong field, add an override in [`scripts/download-item-types.ts`](../scripts/download-item-types.ts):

```typescript
const focusFieldOverrides: Record<string, string> = {
  'card_block': 'item',  // block API key -> field API key
};
```

**Finding the values:**
- **Block API key**: Convert `__typename` to snake_case (`CardBlockRecord` → `card_block`) or check DatoCMS model settings
- **Field API key**: Check DatoCMS field settings or `itemTypes[typename].focusField` in `itemTypes.json`

Then regenerate: `npm run prep:download-item-types`

## Visual Editing

**Visual Editing** lets CMS editors hover the preview iframe and see which field produced each element, then click to jump straight to that field in DatoCMS. It is active **only in preview mode** (see [Enable preview mode](#enable-preview-mode)).

It relies on two mechanisms that always work together:

1. **Stega-encoded strings** - DatoCMS's GraphQL API injects invisible Unicode characters into every string returned in preview mode. Those markers encode the record id and field path. Rendered as text they are harmless, but used as a URL, `href`, phone number, or compared to an enum they break behavior. The `stripStega` helper removes them.
2. **`data-datocms-content-link-*` attributes** - HTML hints that tell the in-iframe overlay which DOM elements map to which content, so hovering highlights the right thing and clicking focuses the right field.

Both the helper and the attributes come from the [`@datocms/content-link`](https://github.com/datocms/content-link) library - refer to its README for the authoritative, up-to-date API reference.

### When to use `stripStega`

Import from the official package:

```ts
import { stripStega } from '@datocms/content-link';
```

Use it on any CMS string **whose value (not its displayed form) drives behavior**. 
Rule of thumb: if the string goes into an `href`, a `tel:`/`mailto:`, a `new URL()`, a conditional comparison, a CSS class, a JSON key, or any API call - strip it. 
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

Three data attributes, each with a distinct role:

#### `data-datocms-content-link-source`

Marks the element that renders **one specific field value**. The attribute's value is a human-readable label the editor will see in the overlay (usually the field's own text, alt, or title).

```astro
<figure data-datocms-content-link-source={image.alt || image.title}>
  <img src={imageUrl} alt={altText} />
</figure>
```

Use on the outermost element that "is" the field - e.g. a `<figure>` around an image or video, a `<div>` around an embed block. See examples in [`EmbedBlock.astro`](../src/blocks/EmbedBlock/EmbedBlock.astro), [`Image.astro`](../src/blocks/ImageBlock/Image.astro) and [`VideoEmbedBlock.astro`](../src/blocks/VideoEmbedBlock/VideoEmbedBlock.astro).

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
- [ ] **Only rendering prose / a single scalar value?** → Nothing to add. `Blocks.astro` already provides the group/boundary wrapping when your block is rendered as part of a page's blocks list.
