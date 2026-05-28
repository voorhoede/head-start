# Vue SEO & Meta Tags — `toHead()`

See `seo-concepts.md` for the shared GraphQL query shape and tag concatenation pattern.

Utility for rendering SEO meta tags, social share tags, and favicons from DatoCMS's `_seoMetaTags` and `faviconMetaTags` GraphQL queries. Returns data in the format expected by `vue-meta` (Options API) or `@unhead/vue` (Composition API / Nuxt 3).

## GraphQL Queries

See `seo-concepts.md` for the query shape and tag concatenation pattern. Examples below assume tags are fetched as `data.page.seo` and `data.site.favicon`.

## `toHead()`

Takes one or more arrays of `Tag` objects and returns an object compatible with `vue-meta`'s `metaInfo` / Nuxt's `head` / `@unhead/vue`'s `useHead`.

### With `@unhead/vue` (Composition API / Nuxt 3)

```vue
<script setup>
import { toHead, useQuerySubscription } from 'vue-datocms';
import { useHead } from '@unhead/vue';
import { computed } from 'vue';

const { data } = useQuerySubscription({
  query: QUERY,
  token: 'YOUR_API_TOKEN',
});

const metaTags = computed(() =>
  toHead(
    data.value ? [...data.value.page.seo, ...data.value.site.favicon] : [],
  ),
);

useHead(metaTags);
</script>
```

### With `vue-meta` (Options API)

```vue
<script>
import { toHead } from 'vue-datocms';
import { request } from './lib/datocms';

export default {
  data() {
    return { data: null };
  },
  async mounted() {
    this.data = await request({ query });
  },
  metaInfo() {
    if (!this || !this.data) {
      return;
    }
    return toHead(this.data.page.seo, this.data.site.favicon);
  },
};
</script>
```

### With Nuxt 3 `useHead`

```vue
<script setup>
import { toHead } from 'vue-datocms';
import { computed } from 'vue';

const { data } = await useAsyncData(() => fetchFromDatoCMS());

const metaTags = computed(() =>
  toHead([...data.value.page.seo, ...data.value.site.favicon]),
);

useHead(metaTags);
</script>
```

## Utility Summary

| Utility | Output | Use Case |
| - | - | - |
| `toHead()` | Object (`{ title, meta, link }`) | `vue-meta`, `@unhead/vue`, Nuxt `useHead()` |

**Note:** Unlike react-datocms which provides multiple utilities (`renderMetaTags`, `toNextMetadata`, `toRemixMeta`), vue-datocms provides a single `toHead()` function that works with all Vue-based meta tag management solutions.
