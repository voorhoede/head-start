# Search Form Block

**Content block with a pre-filled search form.**

## Features

- Semantic search form: `form[role="search"]`.
- Semantic search input: `input[type="search"]`.
- Input is prefilled with query defined in CMS (`block: { query: 'text' }`) if provided.
- Input is prefilled with query from URL (`?query=text`) if otherwise provided.
- Input is prefilled with path name from URL `/:locale/:path-name/` if no other value is available.
