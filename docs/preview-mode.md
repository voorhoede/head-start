# Preview Mode

**Head Start provides a preview mode to view content changes live, without the need for a new deployment.**

## Enable preview mode

To enable preview mode for a git branch, you must add it to [`config/preview.ts`](../config/preview.ts). Preview branches will deploy as `output: 'server'` rather than `output: 'hybrid'`, ignoring all `getStaticPaths()` and always rendering the page during run-time. The `preview` branch is configured as one of the preview branches and is automatically kept in sync with the `main` branch, so it can be used as preview equivalent, for example from the CMS.

### Local development

If you want to see the preview mode UI (preview bar, subscriptions) locally:

- Make sure your current git branch is included in [`config/preview.ts`](../config/preview.ts).
- Set `HEAD_START_PREVIEW_SECRET` and `DATOCMS_READONLY_API_TOKEN` in your local `.env`.
- Enter preview mode via `/api/preview/enter/?secret=...` (or the preview login form).

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

<PreviewModeSubscription query={ query } variables={ variables }  />
<h1>{page.title}</h1>
```

## Preview mode bar

When in preview mode a bar in the user interface displays the status of the connection with the CMS, along with a link to exit preview mode. Depending on the layout of your project, you may want to move the preview mode bar to another position, for example if your project has a sticky header.

## Edit in DatoCMS link

When in preview mode, the preview bar can also show an **“edit in DatoCMS”** link. This opens the DatoCMS **record editor** in a new tab.

### Requirements

- `@lib/site.json` must include `internalDomain` like `head-start.admin.datocms.com` so the `{project}` can be derived.
- The app must know the current DatoCMS environment (configured in `datocms-environment.ts`).
- Env vars (preview mode + DatoCMS access):
  - `HEAD_START_PREVIEW_SECRET`: required to enter/exit preview mode.
  - `DATOCMS_READONLY_API_TOKEN`: required for DatoCMS data loading in preview mode (also used for the preview bar connection).

### What’s manual vs auto-generated

**You maintain (manual):**

- `datocms-environment.ts` → `datocmsEnvironment` (which environment the editor link should target).
- Any GraphQL query that wants an editor link must include **`id`** and **`__typename`** for the record you pass into the component.

**Auto-generated / downloaded (don’t edit):**

- `src/lib/site.json`: downloaded site config (includes `internalDomain` used to derive the DatoCMS `{project}` subdomain). This file is generated/overwritten by `scripts/download-site-data.ts`.
- `src/lib/datocms/item-types.json`: downloaded list of model API keys → item type ids.
- `src/lib/datocms/modelApiKeys.ts`: auto-generated `__typename` → model API key map.

When models change, re-run:

```bash
npm run prep:download-item-types
npm run prep:generate-model-api-keys
```

### How it works (high level)

- The editor URL is built using the project name from `@lib/site.json` and the current environment.
- If the project name can’t be derived, the link is not shown.

### How it works (detailed)

The “open DatoCMS” / “edit in DatoCMS” link is rendered by:

- `src/components/PreviewMode/features/EditInDatoCms/EditInDatoCms.astro`

#### Step-by-step flow

1. **We get a record identity**

- The component expects a `datocmsRecord` with **`id`** and **`__typename`**.
- `__typename` lets us map the record to a DatoCMS **model API key**, and then to an **item type id**.

2. **We derive the DatoCMS project + environment**

- **Project name** comes from `@lib/site.json` `internalDomain` (the `{project}` part of `{project}.admin.datocms.com`).
- **Environment** comes from `datocms-environment.ts` (unless explicitly passed).

3. **We build an editor URL**

- `getEditorLinkFromRecord()` resolves `itemTypeId` using:
  - `src/lib/datocms/modelApiKeys.ts` (auto-generated `__typename` → model API key)
  - `src/lib/datocms/item-types.json` (downloaded model API key → item type id)
- `buildEditorLink()` builds the final URL in:
  - `src/components/PreviewMode/features/EditInDatoCms/lib/buildEditorLink.ts`

4. **We decide whether to show the link**

- If we can resolve everything needed to build a **record editor URL** (`recordId`, `itemTypeId`, project, environment) → we render the link.
- Otherwise → we return `null` and the UI **does not show** the “edit in DatoCMS” link.

The URL format is:

```text
https://{project}.admin.datocms.com/environments/{environment}/editor

# when we know the record model
https://{project}.admin.datocms.com/environments/{environment}/editor/item_types/{itemTypeId}/items/{recordId}/edit
```

### Examples

#### Example 1: Deep-link to a record (shown)

If `internalDomain` is `head-start.admin.datocms.com`, environment is `feat-test`, and we can resolve the `itemTypeId`:

```text
https://head-start.admin.datocms.com/environments/feat-test/editor/item_types/{itemTypeId}/items/{recordId}/edit
```

The link text is “edit in DatoCMS”.

#### Example 3: What to pass to the component

Any query feeding this feature must include `id` and `__typename` for the record you want to edit:

```text
id
__typename
```

### Keeping mappings up to date

When DatoCMS models change, re-run:

```bash
npm run prep:download-item-types
npm run prep:generate-model-api-keys
```
