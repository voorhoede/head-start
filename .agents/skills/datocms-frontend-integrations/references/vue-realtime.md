# Vue Real-Time Updates — `useQuerySubscription`

Vue 3 composable for live content updates via DatoCMS's [Real-time Updates API](https://www.datocms.com/docs/real-time-updates-api/api-reference). Receives updated query results in real-time over Server-Sent Events (SSE) and reconnects automatically on network failures.

See `realtime-concepts.md` for shared initialization options, connection status values, error object shape, and the `fetcher` gotcha.

## Contents

- Basic Usage
- Composable Signature
- Initialization Options
- Connection Status
- Error Object
- Integration with Draft Mode
- Full Example with SEO
- Critical: The `fetcher` Gotcha

## Basic Usage

```vue
<script setup>
import { useQuerySubscription } from 'vue-datocms';

const { status, error, data } = useQuerySubscription({
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

const statusMessage = {
  connecting: 'Connecting to DatoCMS...',
  connected: 'Connected to DatoCMS, receiving live updates!',
  closed: 'Connection closed',
};
</script>

<template>
  <div>
    <p>Connection status: {{ statusMessage[status] }}</p>

    <div v-if="error">
      <h1>Error: {{ error.code }}</h1>
      <div>{{ error.message }}</div>
      <pre v-if="error.response">{{ JSON.stringify(error.response, null, 2) }}</pre>
    </div>

    <ul v-if="data">
      <li v-for="blogPost in data.allBlogPosts" :key="blogPost.slug">
        {{ blogPost.title }}
      </li>
    </ul>
  </div>
</template>
```

## Composable Signature

```ts
const {
  data: Ref<QueryResult | undefined>,
  error: Ref<ChannelErrorData | null>,
  status: Ref<ConnectionStatus>,
} = useQuerySubscription(options);
```

**Important:** Unlike the React hook, the returned `data`, `error`, and `status` are Vue `Ref` values. Access their values with `.value` in `<script>` and use them directly in `<template>`.

## Initialization Options

See `realtime-concepts.md` for the full options table shared across all frameworks.

## Connection Status

See `realtime-concepts.md` for connection status values.

## Error Object

See `realtime-concepts.md` for the error object shape.

## Integration with Draft Mode

When used in a draft mode context, pass the relevant options:

```vue
<script setup>
import { useQuerySubscription } from 'vue-datocms';

const { data } = useQuerySubscription({
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
</script>
```

## Full Example with SEO

```vue
<script setup>
import { Image, StructuredText, toHead, useQuerySubscription } from 'vue-datocms';
import { useHead } from '@unhead/vue';
import { computed } from 'vue';

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

const { data, error, status } = useQuerySubscription({
  query,
  variables: { first: 4 },
  token: 'YOUR_API_TOKEN',
});

const metaTags = computed(() =>
  toHead(
    data.value ? [...data.value.page.seo, ...data.value.site.favicon] : [],
  ),
);

useHead(metaTags);

const statusMessage = {
  connecting: 'Connecting to DatoCMS...',
  connected: 'Connected to DatoCMS, receiving live updates!',
  closed: 'Connection closed',
};
</script>

<template>
  <div>
    <div>
      <span v-if="status === 'connected'" class="connected-badge" />
      {{ statusMessage[status] }}
    </div>

    <div v-if="error">
      <h1>Error: {{ error.code }}</h1>
      <div>{{ error.message }}</div>
      <pre v-if="error.response">{{ JSON.stringify(error.response, null, 2) }}</pre>
    </div>

    <div v-if="data">
      <article v-for="blogPost in data.blogPosts" :key="blogPost.id">
        <Image :data="blogPost.coverImage.responsiveImage" />
        <h2>{{ blogPost.title }}</h2>
        <StructuredText :data="blogPost.excerpt" />
      </article>
    </div>
  </div>
</template>
```

## Critical: The `fetcher` Gotcha

See `realtime-concepts.md` for the general rule. In Vue, define `fetcher` as a `const` before calling `useQuerySubscription` in `<script setup>`.
