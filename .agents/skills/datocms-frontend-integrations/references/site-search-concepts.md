# Site Search Concepts

Shared concepts for DatoCMS Site Search widgets across React and Vue. For framework-specific hooks/composables and rendering patterns, see the dedicated framework reference.

## How It Works

The `useSiteSearch` hook/composable manages all search form logic: query text, pagination, and locale filtering. It calls the DatoCMS Search API internally via a CMA client. You control the rendering.

## Required Dependencies

Both React and Vue implementations require `@datocms/cma-client-browser`:

```js
import { buildClient } from '@datocms/cma-client-browser';

const client = buildClient({ apiToken: 'YOUR_API_TOKEN' });
```

The API token should be a read-only token with Site Search permissions.

## Initialization Options

| Option | Type | Required | Default | Description |
| - | - | - | - | - |
| `client` | CMA Client instance | Yes | — | Instance from `buildClient()` of `@datocms/cma-client-browser` |
| `searchIndexId` | string | Yes | — | Search index ID from the DatoCMS dashboard |
| `fuzzySearch` | boolean | No | `false` | Enable approximate matching |
| `resultsPerPage` | number | No | `8` | Results per page |

## State Behavior

The hook/composable returns a `state` object with the current query, locale, and page. Changing any state value triggers a new API request automatically.

- **React:** Use setter functions (`state.setQuery()`, `state.setPage()`, `state.setLocale()`)
- **Vue:** Use direct assignment or `v-model` (`state.query = ...`, `state.page = ...`)

## Loading and Error States

- If both `error` and `data` are `undefined`/`null`, the search is loading — show a spinner
- `error` is a string message on API failure
- `data` contains `pageResults`, `totalResults`, and `totalPages` when available
