# Astro Real-Time Updates — `<QueryListener />`

Astro component for live content reloads via DatoCMS's [Real-time Updates API](https://www.datocms.com/docs/real-time-updates-api/api-reference). **Fundamentally different from React/Vue/Svelte** — instead of updating data in place, `<QueryListener />` triggers a **full page reload** when query content changes. This makes it ideal for instant previews while editing content in DatoCMS.

`<QueryListener />` is based on the `subscribeToQuery` helper from the [datocms-listen](https://www.npmjs.com/package/datocms-listen) package and automatically reconnects on network failures.

See `realtime-concepts.md` for shared initialization options and the `fetcher` gotcha.

## Contents

- Setup
- Basic Usage
- Integration with Draft Mode
- Conditional Rendering
- Initialization Options
- Key Differences from React, Vue, and Svelte

## Setup

```js
import { QueryListener } from '@datocms/astro/QueryListener';
```

**Note:** `@datocms/astro` uses subpath imports — always import from `@datocms/astro/QueryListener`, not from `@datocms/astro`.

## Basic Usage

The pattern for `<QueryListener />` is fundamentally different from React's `useQuerySubscription`, Vue's `useQuerySubscription`, or Svelte's `querySubscription`:

1. **Fetch data server-side** in the Astro frontmatter (as usual)
2. **Render the page** with the server-fetched data (as usual)
3. **Add `<QueryListener />`** at the bottom — it subscribes client-side and triggers a page reload when content changes

```astro
---
import { QueryListener } from '@datocms/astro/QueryListener';
import { executeQuery } from '@datocms/cda-client';

const query = `
  query {
    homepage {
      title
    }
  }
`;

const data = await executeQuery(query, { token: '<YOUR-API-TOKEN>' });
---

<h1>{data.homepage.title}</h1>

<QueryListener query={query} token="<YOUR-API-TOKEN>" />
```

When content changes in DatoCMS, `<QueryListener />` detects the change and reloads the page, causing Astro to re-fetch the data server-side with the updated content.

## Integration with Draft Mode

When used in a draft mode context, pass the relevant options to match your `executeQuery` call:

```astro
---
import { QueryListener } from '@datocms/astro/QueryListener';
import { executeQuery } from '@datocms/cda-client';

const query = `
  query {
    homepage {
      title
      content { value }
    }
  }
`;

const data = await executeQuery(query, {
  token: draftModeToken,
  includeDrafts: true,
  excludeInvalid: true,
  contentLink: 'v1',
  baseEditingUrl: 'https://your-project.admin.datocms.com/environments/main',
});
---

<h1>{data.homepage.title}</h1>

<QueryListener
  query={query}
  token={draftModeToken}
  includeDrafts={true}
  excludeInvalid={true}
  contentLink="v1"
  baseEditingUrl="https://your-project.admin.datocms.com/environments/main"
/>
```

**Important:** The `<QueryListener />` options should match the options you pass to `executeQuery` so the subscription monitors the same query configuration.

## Conditional Rendering

Only render `<QueryListener />` when in draft mode to avoid unnecessary subscriptions in production:

```astro
---
import { QueryListener } from '@datocms/astro/QueryListener';

const isDraftMode = /* your draft mode check */;
---

<h1>{data.homepage.title}</h1>

{isDraftMode && (
  <QueryListener
    query={query}
    token={draftModeToken}
    includeDrafts={true}
    excludeInvalid={true}
  />
)}
```

## Initialization Options

See `realtime-concepts.md` for the full options table. `<QueryListener />` accepts the same core options as props, except it does not expose `fetcher` or `eventSourceClass`.

## Key Differences from React, Vue, and Svelte

| Feature | React / Vue / Svelte | Astro |
| - | - | - |
| Mechanism | Live data update in place | Page reload on content change |
| Component/hook | `useQuerySubscription` / `querySubscription` | `<QueryListener />` |
| State management | Returns reactive `data`, `error`, `status` | No client state — server re-renders on reload |
| Connection status | Available via returned state | Not exposed (internal) |
| Error handling | Available via `error` state | Not exposed (internal) |
| Use case | SPAs with live-updating UI | SSR/SSG pages with draft preview reloading |

The page-reload approach is a natural fit for Astro's server-first architecture. Content is always rendered server-side, and `<QueryListener />` simply triggers a re-render when changes are detected.
