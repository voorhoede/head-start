# Search Form Block

**Content block with a pre-filled search form.**

## Features

- Semantic search form: `form[role="search"]`.
- Semantic search input: `input[type="search"]`.

## Pre-fill behavior

The search input is pre-filled automatically based on context. The first available value wins:

1. **CMS query** — a query set directly on the block in the CMS (`block.query`).
2. **URL query parameter** — `?query=my+search` in the page URL.
3. **URL path segment** — the last path segment of the current URL (e.g. `/en/my-topic/` → `my topic`).
4. **Empty** — the input starts blank if none of the above apply.
