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
import PreviewModeProvider from '@components/PreviewMode/PreviewModeProvider.astro';
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
import PreviewModeSubscription from '@components/PreviewMode/PreviewModeSubscription.astro';
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
- **Project name**: extracted from `internalDomain` in `@lib/site.json`
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
