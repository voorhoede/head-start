# Real-Time Updates Concepts

Reference for real-time content updates in DatoCMS — live content streaming without page reloads.

## Contents

- What Real-Time Updates Are
- How It Works
- When to Use
- Client Libraries
- Pattern: Fetch Initial + Subscribe
- Initialization Options
- Connection Status
- Error Object
- Critical: The `fetcher` Gotcha
- Rate Limiting
- Error Handling

## What Real-Time Updates Are

DatoCMS Real-time Updates API pushes content changes via Server-Sent Events (SSE). Frontend receives updates when editors modify records, no page reload needed.

## How It Works

1. **Client POSTs GraphQL query** to `https://graphql-listen.datocms.com`
2. **Server returns ephemeral channel URL** (expires 15 seconds)
3. **Client connects via EventSource** (SSE) to channel URL
4. **Server pushes events:**
   - `update` — New query result data
   - `channelError` — Error occurred, includes `fatal` flag

DatoCMS client libraries abstract SSE connection, reconnection, and event parsing.

## When to Use

- **Draft mode previews** — Editors see changes as they type, no refresh
- **Visitor-facing live content** — Show live updates to visitors (e.g., live events, breaking news)

Most commonly: draft mode only, where subscription is enabled alongside draft token.

## Client Libraries

Framework-specific libraries wrap SSE subscription:

| Framework | Package | API |
| - | - | - |
| React / Next.js | `react-datocms` | `useQuerySubscription` hook |
| SvelteKit | `@datocms/svelte` | `querySubscription` store |
| Nuxt (Vue) | `vue-datocms` | `useQuerySubscription` composable |
| Astro | `@datocms/astro` | `QueryListener` component |

## Pattern: Fetch Initial + Subscribe

Standard pattern:

1. **Server-side:** Execute GraphQL query for initial data
2. **Client-side:** Pass initial data + query + token to subscription library
3. **Subscription takes over:** Uses initial data immediately, then listens for live updates

Ensures fast initial page loads (server-rendered) with seamless live updates after hydration.

```
Server: executeQuery(query, { token, includeDrafts: true })
         ↓ initialData
Client: useQuerySubscription({ query, token, initialData, includeDrafts: true })
         ↓ live data
Render: display data (auto-updates on changes)
```

## Initialization Options

All framework implementations accept same core options:

| Option | Type | Required | Default | Description |
| - | - | - | - | - |
| `enabled` | boolean | No | `true` | Whether subscription is active |
| `query` | string \| `TypedDocumentNode` | Yes | — | GraphQL query to subscribe to |
| `token` | string | Yes | — | DatoCMS API token |
| `variables` | Object | No | — | GraphQL variables for query |
| `includeDrafts` | boolean | No | — | If true, returns draft records |
| `excludeInvalid` | boolean | No | — | If true, filters invalid records |
| `environment` | string | No | primary | DatoCMS environment name |
| `contentLink` | `'v1'` \| undefined | No | — | Enables Content Link metadata embedding |
| `baseEditingUrl` | string | No | — | Base URL of DatoCMS project (for Content Link) |
| `cacheTags` | boolean | No | — | If true, receives Cache Tags with query |
| `initialData` | Object | No | — | Initial data for first render (e.g., server-fetched) |
| `reconnectionPeriod` | number | No | `1000` | Milliseconds to wait before reconnecting on network error |
| `fetcher` | fetch-like function | No | `window.fetch` | Custom fetch function for registration query |
| `eventSourceClass` | EventSource-like class | No | `window.EventSource` | Custom EventSource class for SSE connection |
| `baseUrl` | string | No | `https://graphql-listen.datocms.com` | Base URL for subscription endpoint |

## Connection Status

| Status | Description |
| - | - |
| `connecting` | Subscription channel trying to connect |
| `connected` | Channel open, receiving live updates |
| `closed` | Channel permanently closed due to fatal error (e.g., invalid query) |

## Error Object

| Property | Type | Description |
| - | - | - |
| `code` | string | Error code (e.g., `INVALID_QUERY`) |
| `message` | string | Human-friendly error description |
| `response` | Object | Raw response from endpoint (if available) |

## Critical: The `fetcher` Gotcha

**Define `fetcher` as stable reference outside component render cycle.** Inline definitions create new function references on every render/re-evaluation, causing infinite reconnection loop.

- **React:** Define `fetcher` as `const` outside component function
- **Vue:** Define `fetcher` as `const` before calling `useQuerySubscription`
- **Svelte:** Define `fetcher` at top of `<script>` block
- **Astro:** Define `fetcher` before passing to `<QueryListener>`

## Rate Limiting

- **Max 500 concurrent SSE connections** per DatoCMS project
- **Update events consume CDA API requests** — each update re-executes query
- **Homogeneous connections** (same query + token) share load efficiently — DatoCMS deduplicates identical subscriptions

## Error Handling

Subscription libraries surface errors with `fatal` flag:

- **`fatal: true`** — Connection cannot recover. Reconnection won't help. Display error to user.
- **`fatal: false`** — Transient error. Library automatically attempts to reconnect.

See [Error Object](#error-object) table for full error shape.
