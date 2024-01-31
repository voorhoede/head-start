# Search

**Head Start provides out-of-the-box Search functionality in the shape of a search page and API endpoints to create your own search experience.**

The search functionality uses [DatoCMS Site Search](https://www.datocms.com/docs/site-search) under the hood.

## Search page

A dedicated search page is available via `/[locale]/search/`. Its key features are:

- Provides a basic search form (with `role="search"`).
- Lists search results with highlights of `query` matches.
- Search results link to matching pages using [Text fragments (`#:~:text={query}`)](https://developer.mozilla.org/en-US/docs/Web/Text_fragments) so browsers can highlight and scroll to the query.
- Supports a `?query=` parameter, used by the form and Open Search (see below).

[Open Search](https://developer.mozilla.org/en-US/docs/Web/OpenSearch) is configured, so browsers and other applications can automatically detect the search page. See `opensearch.xml(.ts)` and references to it.

## Search utilities

You can create your own enhanced search experience - like a search widget in the app header, client-side autosuggestions, async results, etc - using these available search utitilities:

### Search lib function

```ts
import { datocmsSearch } from '@lib/datocms';

const { meta, results } = await datocmsSearch({
  locale: 'en',
  query: 'some text',
  fuzzy?: false, // defaults to true
});
```

### Search JSON API endpoint

```ts
const { data } = await fetch('/api/search/?locale=en&query=some text');
const { meta, results } = data;
```

URL parameters:

 - `locale`: Site locale (required)
 - `query`: Search query (required)
 - `fuzzy`: Use fuzzy search? Use `'true'|'1'|'false'|'0'` (optional, default: 'true')

### Search HTML Partial endpoint

```ts
const response = await fetch('/{locale}/search/results.partial/?query=some text');
const resultsHtml = await response.text();
```

URL parameters:

 - `locale`: Site locale (required)
 - `query`: Search query (required)
 