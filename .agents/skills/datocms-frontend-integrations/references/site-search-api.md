# Generic Site Search API Patterns

Use this reference when you need DatoCMS Site Search outside the packaged React/Vue widgets. Typical cases:

- SvelteKit, Astro, or other frameworks without `useSiteSearch`
- Custom search UIs that need full control over rendering
- Server-side search helpers that normalize paging and highlighting

## Contents

- Dato-side prerequisites
- Search index provisioning via CMA
- Search requests
- Returned result shape
- Recommended helper contract
- Safety rules

## Dato-side prerequisites

Before a search UI can work, the Dato project needs:

1. A **Search Index**
2. A least-privilege **role** with only `can_perform_site_search` enabled
3. An **API token** associated with that role

Use a public-facing search token for client-side search requests. Never expose a CMA-capable management token in the browser.

Always pass `search_index_id` explicitly, even if the project currently has a single index.

## Search index provisioning via CMA

Search-index creation belongs on a trusted server or one-shot setup script using a CMA-capable token:

```ts
import { buildClient } from '@datocms/cma-client-node';

const client = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN,
});

const searchIndex = await client.searchIndexes.create({
  name: 'Production Website',
  enabled: true,
  frontend_url: 'https://www.example.com/',
  user_agent_suffix: null,
});

await client.searchIndexes.trigger(searchIndex.id);
```

Useful CMA methods:

- `client.searchIndexes.list()`
- `client.searchIndexes.create()`
- `client.searchIndexes.update()`
- `client.searchIndexes.trigger()`
- `client.searchIndexes.destroy()`

If the project already has multiple search indexes, preserve them. For new integrations, default to one index unless the site clearly has separate public sections that need independent crawling rules.

## Search requests

For custom integrations, use the low-level Site Search API through the CMA client:

```ts
import { buildClient } from '@datocms/cma-client-browser';

const client = buildClient({
  apiToken: import.meta.env.PUBLIC_DATOCMS_SITE_SEARCH_TOKEN,
});

const { data: results, meta } = await client.searchResults.rawList({
  filter: {
    query: 'term to search',
    fuzzy: true,
    search_index_id: import.meta.env.PUBLIC_DATOCMS_SITE_SEARCH_INDEX_ID,
    locale: 'en',
  },
  page: {
    limit: 20,
    offset: 0,
  },
});
```

Important behaviors:

- Default page size is 20
- Maximum page size is 100
- `meta.total_count` gives the total matching result count
- Search indexes can take a short time to reflect newly crawled content

## Returned result shape

Each result includes:

- `attributes.title`
- `attributes.body_excerpt`
- `attributes.url`
- `attributes.score`
- `attributes.highlight.title`
- `attributes.highlight.body`

Highlight values wrap matches in `[h]...[/h]` markers. Convert them into your preferred markup in the presentation layer instead of storing transformed HTML.

## Recommended helper contract

When scaffolding a framework-native search page, normalize the raw response into a stable helper return value such as:

```ts
type SearchPageResult = {
  results: Array<{
    id: string;
    title: string;
    bodyExcerpt: string;
    url: string;
    titleHighlights: string[];
    bodyHighlights: string[];
  }>;
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
};
```

Keep the helper responsible for pagination math and API calling. Keep the route or component responsible for rendering and empty/loading/error states.

## Safety rules

- Never ship a CMA-capable token to the browser
- Always pass `search_index_id`
- Keep search tokens read-only and scoped to Site Search
- Treat missing token values or missing index ids as a `scaffolded` result
