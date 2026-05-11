# Svelte Real-Time Updates — `querySubscription`

Svelte store for live content updates via DatoCMS's [Real-time Updates API](https://www.datocms.com/docs/real-time-updates-api/api-reference). Returns a Svelte store that receives updated query results in real-time over Server-Sent Events (SSE) and reconnects automatically on network failures.

See `realtime-concepts.md` for shared initialization options, connection status values, error object shape, and the `fetcher` gotcha.

## Contents

- Basic Usage
- Store Signature
- Initialization Options
- Connection Status
- Error Object
- Integration with Draft Mode
- Full Example with SEO and Images

## Basic Usage

```svelte
<script>
  import { querySubscription } from '@datocms/svelte';

  const subscription = querySubscription({
    query: `
      query {
        allBlogPosts {
          slug
          title
        }
      }
    `,
    token: 'YOUR_API_TOKEN',
  });

  $: ({ data, error, status } = $subscription);

  const statusMessage = {
    connecting: 'Connecting to DatoCMS...',
    connected: 'Connected to DatoCMS, receiving live updates!',
    closed: 'Connection closed',
  };
</script>

<p>Connection status: {statusMessage[status]}</p>

{#if error}
  <h1>Error: {error.code}</h1>
  <p>{error.message}</p>
  {#if error.response}
    <pre>{JSON.stringify(error.response, null, 2)}</pre>
  {/if}
{/if}

{#if data}
  <ul>
    {#each data.allBlogPosts as blogPost (blogPost.slug)}
      <li>{blogPost.title}</li>
    {/each}
  </ul>
{/if}
```

## Store Signature

```ts
import { querySubscription } from '@datocms/svelte';

const subscription = querySubscription(options);

// Access values via Svelte store syntax ($)
$: ({ data, error, status } = $subscription);
```

**Important:** Unlike React's `useQuerySubscription` (returns plain objects) and Vue's `useQuerySubscription` (returns Vue `Ref` values), Svelte's `querySubscription` returns a **Svelte store**. Access values using the `$` prefix syntax.

## Initialization Options

See `realtime-concepts.md` for the full options table shared across all frameworks.

## Connection Status

See `realtime-concepts.md` for connection status values.

## Error Object

See `realtime-concepts.md` for the error object shape.

## Integration with Draft Mode

When used in a draft mode context, pass the relevant options:

```svelte
<script>
  import { querySubscription } from '@datocms/svelte';

  const subscription = querySubscription({
    query: QUERY,
    token: draftModeToken,
    includeDrafts: true,
    excludeInvalid: true,
    // For Content Link (visual editing):
    contentLink: 'v1',
    baseEditingUrl: 'https://your-project.admin.datocms.com/environments/main',
    // Server-fetched data as initial render:
    initialData: serverData,
  });

  $: ({ data, error, status } = $subscription);
</script>
```

## Full Example with SEO and Images

```svelte
<script>
  import { querySubscription } from '@datocms/svelte';
  import { Image, Head, StructuredText } from '@datocms/svelte';

  const query = `
    query AppQuery($first: IntType) {
      page: blog {
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
      blogPosts: allBlogPosts(first: $first) {
        id
        title
        slug
        excerpt { value }
        coverImage {
          responsiveImage(imgixParams: { w: 550, auto: format }) {
            src
            width
            height
            alt
            base64
          }
        }
      }
    }
  `;

  const subscription = querySubscription({
    query,
    variables: { first: 4 },
    token: 'YOUR_API_TOKEN',
  });

  $: ({ data, error, status } = $subscription);

  const statusMessage = {
    connecting: 'Connecting to DatoCMS...',
    connected: 'Connected to DatoCMS, receiving live updates!',
    closed: 'Connection closed',
  };
</script>

{#if data}
  <Head data={[...data.page.seo, ...data.site.favicon]} />
{/if}

<div>
  <p>
    {#if status === 'connected'}<span class="connected-badge" />{/if}
    {statusMessage[status]}
  </p>

  {#if error}
    <h1>Error: {error.code}</h1>
    <p>{error.message}</p>
    {#if error.response}
      <pre>{JSON.stringify(error.response, null, 2)}</pre>
    {/if}
  {/if}

  {#if data}
    {#each data.blogPosts as blogPost (blogPost.id)}
      <article>
        <Image data={blogPost.coverImage.responsiveImage} />
        <h2>{blogPost.title}</h2>
        <StructuredText data={blogPost.excerpt} />
      </article>
    {/each}
  {/if}
</div>
```
