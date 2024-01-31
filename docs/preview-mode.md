# Preview Mode

**Head Start provides a preview mode to view content changes live, without the need for a new deployment.**

## Enable preview mode

To enable preview mode for a git branch, you must add it to [`config/preview.ts`](../config/preview.ts). Preview branches will deploy as `output: 'server'` rather than `output: 'hybrid'`, ignoring all `getStaticPaths()` and always rendering the page during run-time. The `preview` branch is configured as one of the preview branches and is automatically kept in sync with the `main` branch, so it can be used as preview equivalent, for example from the CMS.

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
