# React Site Search — `useSiteSearch`

React hook for building a [DatoCMS Site Search](https://www.datocms.com/docs/site-search) widget. Handles all form logic (query, pagination, locale) — you control the rendering.

See `site-search-concepts.md` for shared initialization options, state behavior, and loading patterns.

## Contents

- Installation
- Basic Usage
- Initialization Options
- Returned Data Shape
- Complete Example with Pagination

## Installation

Requires `@datocms/cma-client-browser` for API requests:

```bash
npm install react-datocms @datocms/cma-client-browser
```

## Basic Usage

```jsx
import { useSiteSearch } from 'react-datocms';
import { buildClient } from '@datocms/cma-client-browser';

const client = buildClient({ apiToken: 'YOUR_API_TOKEN' });

function SearchWidget() {
  const { state, error, data } = useSiteSearch({
    client,
    searchIndexId: '7497',
  });

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); state.setQuery(query); }}>
        <input
          type="search"
          value={state.query}
          onChange={(e) => state.setQuery(e.target.value)}
        />
      </form>
      {!data && !error && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && (
        <ul>
          {data.pageResults.map((result) => (
            <li key={result.id}>
              <a href={result.url}>{result.title}</a>
              <div>{result.bodyExcerpt}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Initialization Options

See `site-search-concepts.md` for shared options. React additionally supports:

| Option | Type | Default | Description |
| - | - | - | - |
| `highlightMatch` | `(match, key, context: 'title' \| 'bodyExcerpt') => ReactNode` | `(text, key) => <mark key={key}>{text}</mark>` | Custom match highlighting |
| `initialState.query` | string | `''` | Initial search query |
| `initialState.locale` | string | `null` | Initial locale filter |
| `initialState.page` | number | `0` | Initial page number |

## Returned Data Shape

```ts
{
  state: {
    query: string;
    setQuery: (newQuery: string) => void;
    locale: string | undefined;
    setLocale: (newLocale: string) => void;
    page: number;
    setPage: (newPage: number) => void;
  };
  error?: string;
  data?: {
    pageResults: Array<{
      id: string;
      title: ReactNode;        // highlighted if match
      bodyExcerpt: ReactNode;  // highlighted if match
      url: string;
      raw: RawSearchResult;
    }>;
    totalResults: number;
    totalPages: number;
  };
}
```

- **`state`** — Current form state with setter functions. Changing any value triggers a new API request.
- **`error`** — Error message string on API failure, otherwise `undefined`.
- **`data`** — Search results, `undefined` while loading.
- If both `error` and `data` are `undefined`/`null`, the form is loading — show a spinner.

## Complete Example with Pagination

Uses [`react-paginate`](https://www.npmjs.com/package/react-paginate) for pagination:

```jsx
import { buildClient } from '@datocms/cma-client-browser';
import ReactPaginate from 'react-paginate';
import { useSiteSearch } from 'react-datocms';
import { useState } from 'react';

const client = buildClient({ apiToken: 'YOUR_API_TOKEN' });

function SearchPage() {
  const [query, setQuery] = useState('');

  const { state, error, data } = useSiteSearch({
    client,
    searchIndexId: '7497',
    initialState: { locale: 'en' },
    highlightMatch: (text, key, context) =>
      context === 'title' ? (
        <strong key={key}>{text}</strong>
      ) : (
        <mark key={key}>{text}</mark>
      ),
    resultsPerPage: 10,
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          state.setQuery(query);
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={state.locale}
          onChange={(e) => state.setLocale(e.target.value)}
        >
          <option value="en">English</option>
          <option value="it">Italian</option>
        </select>
      </form>

      {!data && !error && <p>Loading...</p>}
      {error && <p>Error! {error}</p>}
      {data && (
        <>
          {data.pageResults.map((result) => (
            <div key={result.id}>
              <a href={result.url}>{result.title}</a>
              <div>{result.bodyExcerpt}</div>
              <div>{result.url}</div>
            </div>
          ))}
          <p>Total results: {data.totalResults}</p>
          <ReactPaginate
            pageCount={data.totalPages}
            forcePage={state.page}
            onPageChange={({ selected }) => state.setPage(selected)}
            activeClassName="active"
            renderOnZeroPageCount={() => null}
          />
        </>
      )}
    </div>
  );
}
```
