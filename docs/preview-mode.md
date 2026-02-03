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

This endpoint can for example be used to link to previews from within the CMS.

When authorised an encrypted cookie is set, to persist preview mode throughout a session. Calling the 'exit preview mode' endpoint removes the cookie and disables preview mode:

```bash
# by default 'exit preview' redirects to home page:
/api/preview/exit/

# you can use `location` to redirect to another page:
/api/preview/exit/?location=/en/some-page/
```

Note: the secret is configured as environment variable `HEAD_START_PREVIEW_SECRET`.

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

- `src/lib/datocms/itemTypes.json` — `__typename` → item type id (generated, in `.gitignore`)

When DatoCMS models change, regenerate:

```bash
npm run prep:download-item-types
```

## Block field path detection

When clicking on a block label in preview mode, the system automatically generates a field path to focus the correct field in DatoCMS. Block labels are only clickable when `PreviewModeSubscription` receives a `record` prop (see above). This is done by detecting the "focus field" for each block type.

### How it works

The focus field is automatically detected based on field types:
- **Rich/structured text fields** (primary content)
- **Media fields** (file, video, image)
- **JSON fields** (structured data like tables)
- **Link fields** (with validators)
- **URL text fields**

**Metadata fields are excluded** (e.g., `title`, `layout`, `style`, `slug`, `id`) since they're configuration rather than editable content.

The script finds the first field matching these criteria (excluding metadata) and uses it as the focus field.

`Blocks.astro` always passes a `fieldPath` prop to every block (the path to that block in the tree). Blocks that do not render nested `<Blocks />` can ignore it.

### Skipping debug labels (skipDebugLabels)

Pass `skipDebugLabels` on `<Blocks />` (or on a block that forwards it, e.g. `GroupingBlock`) when you do not want to render block labels in that subtree. We use this for **PagePartialBlock children**: those blocks live in a separate record (the page partial), so their labels would not take you to the correct field in the editor—the path would point at the wrong record. Skipping labels there avoids confusion.

### Adding a new block

When you add a new block type, the focus field is automatically detected when you run:

```bash
npm run prep:download-item-types
```

The script will:
1. Find the first field matching the criteria above
2. Use it as the focus field for that block type
3. Generate the correct field path (e.g., `body_blocks.en.0.table` for TableBlock)

### Manual override

If automatic detection picks the wrong field, add an override in [`scripts/download-item-types.ts`](../scripts/download-item-types.ts):

```typescript
const FOCUS_FIELD_OVERRIDES: Record<string, string> = {
  'card_block': 'item',  // block API key -> field API key
};
```

**Finding the values:**
- **Block API key**: Convert `__typename` to snake_case (`CardBlockRecord` → `card_block`) or check DatoCMS model settings
- **Field API key**: Check DatoCMS field settings or the `_blockFields` section in `itemTypes.json`

Then regenerate: `npm run prep:download-item-types`
