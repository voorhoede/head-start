# Svelte SEO & Meta Tags — `<Head />`

See `seo-concepts.md` for the shared GraphQL query shape and tag concatenation pattern.

Svelte component for rendering SEO meta tags, social share tags, and favicons from DatoCMS's `_seoMetaTags` and `faviconMetaTags` GraphQL queries. Unlike React's `renderMetaTags()` or Vue's `toHead()`, Svelte uses a `<Head />` component that directly injects `<title>`, `<meta>`, and `<link>` tags into the document's `<head>`.

## GraphQL Queries

See `seo-concepts.md` for the query shape and tag concatenation pattern. Examples below assume tags are fetched as `data.page.seo` and `data.site.favicon`.

## `<Head />`

The `<Head />` component takes a `data` prop — an array of `Tag` objects (with `attributes`, `content`, `tag` properties) in the exact shape returned by DatoCMS's `_seoMetaTags` and `faviconMetaTags` queries — and injects them into the document's `<head>`.

### Basic Usage

```svelte
<script>
  import { Head } from '@datocms/svelte';

  const { data } = $props();
</script>

<Head data={[...data.page.seo, ...data.site.favicon]} />
```

### SvelteKit Example

In a SvelteKit page, use the `<Head />` component with data from your `load` function:

```svelte
<script>
  import { Head } from '@datocms/svelte';

  const { data } = $props();
</script>

<Head data={[...data.page.seo, ...data.site.favicon]} />

<h1>{data.page.title}</h1>
```

### Full Example with Manual Fetch

```svelte
<script>
  import { onMount } from 'svelte';
  import { Head } from '@datocms/svelte';

  const query = `
    query {
      page: homepage {
        title
        seo: _seoMetaTags {
          attributes
          content
          tag
        }
      }
      site: _site {
        favicon: faviconMetaTags {
          attributes
          content
          tag
        }
      }
    }
  `;

  let metaTags = null;

  onMount(async () => {
    const response = await fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer AN_API_TOKEN',
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();
    metaTags = [...json.data.page.seo, ...json.data.site.favicon];
  });
</script>

{#if metaTags}
  <Head data={metaTags} />
{/if}
```

## Utility Summary

| Utility | Type | Use Case |
| - | - | - |
| `<Head />` | Svelte component | Injects `<title>`, `<meta>`, `<link>` tags into `<head>` |

**Note:** Unlike react-datocms which provides multiple utilities (`renderMetaTags`, `toNextMetadata`, `toRemixMeta`) and vue-datocms which provides `toHead()`, `@datocms/svelte` provides a single `<Head />` component that directly manages the document head.
