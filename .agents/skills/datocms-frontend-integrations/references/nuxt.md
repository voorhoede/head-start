# Nuxt — Draft Mode Reference

Nuxt draft mode patterns. Follow Core first, then optional sections.

## Contents

- Core
- Web Previews (Optional)
- Content Link (Optional)
- Real-Time Updates (Optional)
- Cache Tags (Optional)

## Core

### File Structure

```
server/api/
├── draft-mode/
│   ├── enable.ts
│   └── disable.ts
lib/
├── api/
│   ├── draftMode.ts
│   └── utils.ts
composables/
├── useDraftMode.ts          (create)
└── useQuery.ts              (modify existing or create)
nuxt.config.ts               (modify)
```

### Enable Endpoint

**File:** `server/api/draft-mode/enable.ts`

```ts
import { enableDraftMode } from '~/lib/api/draftMode';
import { ensureHttpMethods, isRelativeUrl } from '~/lib/api/utils';

/*
 * This API route enables Draft Mode. If the token is correct, it writes the API
 * Token into a signed cookie that allows access to DatoCMS draft content.
 */
export default eventHandler(async (event) => {
  ensureHttpMethods(event, 'GET');

  const config = useRuntimeConfig();

  const query = getQuery<{ url?: string; token?: string }>(event);
  const url = query.url || '/';

  if (query.token !== config.secretApiToken) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    });
  }

  if (!isRelativeUrl(url)) {
    throw createError({ status: 422, message: 'URL must be relative!' });
  }

  enableDraftMode(event);

  await sendRedirect(event, url);
});
```

Key points:

- Nuxt auto-imports: `eventHandler`, `getQuery`, `useRuntimeConfig`, `sendRedirect`, `createError`
- `url` param (not `redirect`)
- Token from `useRuntimeConfig().secretApiToken`

### Disable Endpoint

**File:** `server/api/draft-mode/disable.ts`

```ts
import { disableDraftMode } from '~/lib/api/draftMode';
import { ensureHttpMethods, isRelativeUrl } from '~/lib/api/utils';

/*
 * This API route disables Draft Mode, by deleting the signed cookie.
 */
export default eventHandler(async (event) => {
  ensureHttpMethods(event, 'GET');

  const query = getQuery<{ url?: string }>(event);
  const url = query.url || '/';

  if (!isRelativeUrl(url)) {
    throw createError({ status: 422, message: 'URL must be relative!' });
  }

  disableDraftMode(event);

  await sendRedirect(event, url);
});
```

### Draft Mode Helper

**File:** `lib/api/draftMode.ts`

```ts
import type { EventHandlerRequest, H3Event } from 'h3';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { CookieSerializeOptions } from 'cookie-es';

/**
 * Generates a JSON Web Token containing the DatoCMS draft CDA token.
 */
function jwtToken() {
  const config = useRuntimeConfig();
  return jwt.sign(
    { datocmsDraftContentCdaToken: config.datocmsDraftContentCdaToken },
    config.signedCookieJwtSecret,
  );
}

const DRAFT_MODE_SERIALIZE_OPTIONS: CookieSerializeOptions = {
  partitioned: true,
  secure: true,
  sameSite: 'none',
};

/**
 * Sets the signed cookie required to enter Draft Mode.
 */
export function enableDraftMode(event: H3Event<EventHandlerRequest>) {
  const config = useRuntimeConfig();
  setCookie(event, config.public.draftModeCookieName, jwtToken(), DRAFT_MODE_SERIALIZE_OPTIONS);
}

/**
 * Disables Draft Mode by deleting the cookie.
 */
export function disableDraftMode(event: H3Event<EventHandlerRequest>) {
  const config = useRuntimeConfig();
  deleteCookie(event, config.public.draftModeCookieName, DRAFT_MODE_SERIALIZE_OPTIONS);
}

/**
 * Checks if Draft Mode is enabled for a given request by verifying the JWT.
 */
export function isDraftModeEnabled(event: H3Event<EventHandlerRequest>) {
  const config = useRuntimeConfig();
  const cookie = getCookie(event, config.public.draftModeCookieName);

  if (!cookie) {
    return false;
  }

  try {
    const payload = jwt.verify(cookie, config.signedCookieJwtSecret) as JwtPayload;
    return !!payload.datocmsDraftContentCdaToken;
  } catch (e) {
    return false;
  }
}

/**
 * Returns the HTTP headers needed to enable Draft Mode.
 */
export function draftModeHeaders(): HeadersInit {
  const config = useRuntimeConfig();
  return {
    Cookie: `${config.public.draftModeCookieName}=${jwtToken()};`,
  };
}
```

Key points:

- JWT payload contains draft CDA token (`datocmsDraftContentCdaToken`) — decoded client-side for real-time
- Nuxt/H3 auto-imports: `setCookie`, `deleteCookie`, `getCookie`
- Cookie opts: `partitioned: true`, `secure: true`, `sameSite: 'none'`

### Utils

**File:** `lib/api/utils.ts`

```ts
import type { EventHandlerRequest, H3Event, HTTPMethod } from 'h3';
import { serializeError } from 'serialize-error';

/**
 * Ensure that an incoming request method matches one of the allowed methods.
 */
export function ensureHttpMethods(event: H3Event<EventHandlerRequest>, ...methods: HTTPMethod[]) {
  const normalizedMethods = Array.isArray(methods) ? methods : [methods];

  if (normalizedMethods.includes(event.method)) {
    return;
  }

  throw createError({
    statusCode: 401,
    message: `Invalid HTTP method, only the following methods are accepted: ${normalizedMethods.join(', ')}`,
  });
}

/**
 * Handle any unexpected errors in an API route.
 */
export function handleUnexpectedError(error: unknown) {
  try {
    throw error;
  } catch (e) {
    console.error(e);
  }

  const { message, ...data } = serializeError(error);

  throw createError({
    statusCode: 500,
    message: message ?? 'An unexpected error occurred',
    data,
  });
}

export function isRelativeUrl(path: string): boolean {
  try {
    new URL(path);
    return false;
  } catch {
    try {
      new URL(path, 'http://example.com');
      return true;
    } catch {
      return false;
    }
  }
}
```

Key points:

- `createError` from Nuxt auto-imports (H3)
- Throw errors, don't return Response
- `ensureHttpMethods` validates HTTP methods

### `useDraftMode` Composable

**File:** `composables/useDraftMode.ts`

```ts
import { jwtDecode } from 'jwt-decode';

export function useDraftMode() {
  const config = useRuntimeConfig();
  const cookie = useCookie(config.public.draftModeCookieName);

  if (!cookie.value) {
    return false;
  }

  try {
    return jwtDecode<{ datocmsDraftContentCdaToken: string }>(cookie.value);
  } catch (e) {
    return false;
  }
}
```

Key points:

- Decodes JWT client-side to extract draft CDA token
- Returns `false` if no cookie/invalid JWT
- Returns decoded payload (`datocmsDraftContentCdaToken`) if valid

### Query Composable

**File:** `composables/useQuery.ts`

```ts
import { buildRequestInit } from '@datocms/cda-client';
import type { TadaDocumentNode } from 'gql.tada';
import { hash } from 'ohash';

type Options<Variables> = {
  variables?: Variables;
};

export async function useQuery<Result, Variables>(
  query: TadaDocumentNode<Result, Variables>,
  options?: Options<Variables>,
) {
  const config = useRuntimeConfig();
  const draftMode = useDraftMode();

  const apiToken = draftMode
    ? draftMode.datocmsDraftContentCdaToken
    : config.public.datocmsPublishedContentCdaToken;

  if (!apiToken) {
    throw new Error('Missing API token');
  }

  const data = await useFetch('https://graphql.datocms.com/', {
    ...buildRequestInit(query, {
      token: apiToken,
      includeDrafts: Boolean(draftMode),
      excludeInvalid: true,
      variables: options?.variables,
    }),
    key: hash([query, options]),
    transform: (response: { data: Result; errors?: any[] }) => {
      if (response.errors)
        throw new Error(
          `Something went wrong while executing the query: ${JSON.stringify(response.errors)}`,
        );
      return response.data;
    },
  });

  return data.data;
}
```

Key points:

- `buildRequestInit` from `@datocms/cda-client` with Nuxt's `useFetch`
- Token: draft from JWT cookie, published from public config
- Returns data directly (no real-time in core)

### Nuxt Config Additions

Add to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    // set by NUXT_DATOCMS_DRAFT_CONTENT_CDA_TOKEN env variable
    datocmsDraftContentCdaToken: '',
    // set by NUXT_SECRET_API_TOKEN env variable
    secretApiToken: '',
    // set by NUXT_SIGNED_COOKIE_JWT_SECRET env variable
    signedCookieJwtSecret: '',

    public: {
      // set by NUXT_PUBLIC_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN env variable
      datocmsPublishedContentCdaToken: '',
      // set by NUXT_PUBLIC_DRAFT_MODE_COOKIE_NAME env variable
      draftModeCookieName: '',
    },
  },
});
```

Key points:

- Private: `NUXT_` env vars
- Public: `NUXT_PUBLIC_` env vars

### Core Environment Variables

```
NUXT_PUBLIC_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN=   # Published content CDA token (public)
NUXT_DATOCMS_DRAFT_CONTENT_CDA_TOKEN=               # Draft content CDA token (private)
NUXT_SECRET_API_TOKEN=                               # Shared secret for endpoint auth (private)
NUXT_SIGNED_COOKIE_JWT_SECRET=                       # JWT signing secret (private)
NUXT_PUBLIC_DRAFT_MODE_COOKIE_NAME=                  # Cookie name, e.g. "datocms-draft-mode" (public)
```

### Core Dependencies

Required:

- `jsonwebtoken` — Sign/verify JWT cookies
- `@types/jsonwebtoken` — TypeScript types (dev)
- `serialize-error` — Serialize error objects
- `jwt-decode` — Decode JWT client-side (`useDraftMode`)

Optional (Web Previews):

- `@datocms/cma-client` — `RawApiTypes`, `ApiTypes`

## Web Previews (Optional)

### Preview Links Endpoint

**File:** `server/api/preview-links/index.ts`

```ts
import type { ApiTypes, RawApiTypes } from '@datocms/cma-client';
import { ensureHttpMethods, handleUnexpectedError } from '~/lib/api/utils';
import { recordToWebsiteRoute } from '~/lib/datocms/recordInfo';

type WebPreviewsRequestBody = {
  item: RawApiTypes.Item;
  itemType: ApiTypes.ItemType;
  locale: string;
};

type PreviewLink = {
  label: string;
  url: string;
  reloadPreviewOnRecordUpdate?: boolean | { delayInMs: number };
};

type WebPreviewsResponse = {
  previewLinks: PreviewLink[];
};

/**
 * Implements the Previews webhook required for the "Web Previews" plugin:
 *
 * https://www.datocms.com/marketplace/plugins/i/datocms-plugin-web-previews#the-previews-webhook
 */
export default eventHandler(async (event) => {
  try {
    ensureHttpMethods(event, 'OPTIONS', 'POST');

    if (event.method === 'OPTIONS') {
      return {};
    }

    const config = useRuntimeConfig();

    const { token } = getQuery(event);

    if (token !== config.secretApiToken) {
      throw createError({ message: 'Invalid token', status: 401 });
    }

    const { item, itemType, locale } = await readBody<WebPreviewsRequestBody>(event, {
      strict: true,
    });

    const url = recordToWebsiteRoute(item, locale, itemType.id);

    const response: WebPreviewsResponse = { previewLinks: [] };

    if (url) {
      if (item.meta.status !== 'published') {
        response.previewLinks.push({
          label: 'Draft version',
          url: new URL(
            `/api/draft-mode/enable?url=${url}&token=${token}`,
            getRequestURL(event),
          ).toString(),
        });
      }

      if (item.meta.status !== 'draft') {
        response.previewLinks.push({
          label: 'Published version',
          url: new URL(
            `/api/draft-mode/disable?url=${url}`,
            getRequestURL(event),
          ).toString(),
        });
      }
    }

    return response;
  } catch (error) {
    handleUnexpectedError(error);
  }
});
```

Key points:

- `readBody` parses request body (Nuxt auto-import)
- `getRequestURL(event)` for base URL
- `url` as redirect param (matches enable/disable)
- `itemType` in body → pass `itemType.id` to `recordToWebsiteRoute`
- CORS via `nuxt.config.ts` route rules, not manual headers

### `recordToWebsiteRoute`

**File:** `lib/datocms/recordInfo.ts`

```ts
import type { RawApiTypes } from '@datocms/cma-client';

/**
 * Maps a DatoCMS record to its frontend URL. Used by the preview-links endpoint.
 *
 * Fill in cases for each of your content models. You can find model IDs
 * in DatoCMS under Settings → Models → click a model → the ID is in the URL.
 */
export function recordToWebsiteRoute(
  item: RawApiTypes.Item,
  _locale: string,
  itemTypeId: string,
) {
  switch (itemTypeId) {
    // Scaffolded example cases. Replace them before calling
    // the Web Previews setup production-ready.
    // TODO: Add your models here. Examples:
    //
    // case 'YOUR_PAGE_MODEL_ID': {
    //   return `/page/${item.attributes.slug}`;
    // }
    //
    // case 'YOUR_BLOG_POST_MODEL_ID': {
    //   return `/blog/${item.attributes.slug}`;
    // }

    default:
      return null;
  }
}
```

Key points:

- Nuxt passes `itemTypeId` separately (from `itemType.id` in request body)
- Switch on model ID strings (not `api_key`)

### Nuxt Config CORS Addition

Add CORS route rule to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  // ... existing config ...
  routeRules: {
    // Add CORS headers on API routes
    '/api/**': { cors: true },
  },
});
```

### Web Previews Dependencies

None beyond Core.

## Content Link (Optional)

### Note on Nuxt Content Link Support

Nuxt starter kit doesn't use `contentLink` or `baseEditingUrl` in query function. `useDraftMode` decodes JWT for real-time but doesn't pass Content Link options.

To add Content Link, modify `useQuery` composable:

```ts
import { buildRequestInit } from '@datocms/cda-client';
import type { TadaDocumentNode } from 'gql.tada';
import { hash } from 'ohash';

type Options<Variables> = {
  variables?: Variables;
};

export async function useQuery<Result, Variables>(
  query: TadaDocumentNode<Result, Variables>,
  options?: Options<Variables>,
) {
  const config = useRuntimeConfig();
  const draftMode = useDraftMode();

  const apiToken = draftMode
    ? draftMode.datocmsDraftContentCdaToken
    : config.public.datocmsPublishedContentCdaToken;

  if (!apiToken) {
    throw new Error('Missing API token');
  }

  const data = await useFetch('https://graphql.datocms.com/', {
    ...buildRequestInit(query, {
      token: apiToken,
      includeDrafts: Boolean(draftMode),
      excludeInvalid: true,
      variables: options?.variables,
      contentLink: draftMode ? 'v1' : undefined,
      baseEditingUrl: draftMode ? config.public.datocmsBaseEditingUrl : undefined,
    }),
    key: hash([query, options]),
    transform: (response: { data: Result; errors?: any[] }) => {
      if (response.errors)
        throw new Error(
          `Something went wrong while executing the query: ${JSON.stringify(response.errors)}`,
        );
      return response.data;
    },
  });

  return data.data;
}
```

### Nuxt Config Content Link Addition

Add `baseEditingUrl` to public runtime config in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    // ... existing config ...
    public: {
      // ... existing public config ...
      // set by NUXT_PUBLIC_DATOCMS_BASE_EDITING_URL env variable
      datocmsBaseEditingUrl: '',
    },
  },
});
```

### ContentLink Component Setup

Create client component with routing for Web Previews Visual tab. Wrap in `<ClientOnly>` (requires browser APIs):

**File:** `components/ContentLink.vue`

```vue
<script setup lang="ts">
import { createController } from '@datocms/content-link';
import { onMounted, onUnmounted, watch } from 'vue';

const router = useRouter();
const route = useRoute();

let controller: ReturnType<typeof createController> | null = null;

onMounted(() => {
  controller = createController({
    onNavigateTo: (path) => {
      router.push(path);
    },
  });
  controller.enableClickToEdit();
});

watch(
  () => route.path,
  (newPath) => {
    controller?.setCurrentPath(newPath);
  },
);

onUnmounted(() => {
  controller?.dispose();
  controller = null;
});
</script>

<template>
  <div />
</template>
```

Add to layout, render only when draft mode enabled. Wrap in `<ClientOnly>`:

```vue
<script setup lang="ts">
const draftMode = useDraftMode();
</script>

<template>
  <ClientOnly>
    <ContentLink v-if="draftMode" />
  </ClientOnly>
  <slot />
</template>
```

### Structured Text with Content Link

Render Structured Text with `vue-datocms`. Wrap in group, add boundaries to embedded blocks/inline records:

```vue
<script setup lang="ts">
import { StructuredText } from 'vue-datocms';
import { stripStega } from '@datocms/content-link';
import { h } from 'vue';

const props = defineProps<{ page: any }>();
</script>

<template>
  <div data-datocms-content-link-group>
    <StructuredText
      :data="page.content"
      :render-block="({ record }) =>
        h('div', { 'data-datocms-content-link-boundary': '' }, [
          h(BlockComponent, { block: record }),
        ])
      "
      :render-inline-record="({ record }) =>
        h('span', { 'data-datocms-content-link-boundary': '' }, [
          h(InlineRecordComponent, { record }),
        ])
      "
      :render-link-to-record="({ record, children, transformedMeta }) =>
        h('a', { ...transformedMeta, href: `/posts/${stripStega(record.slug)}` }, children)
      "
    />
  </div>
</template>
```

Note: `renderLinkToRecord` doesn't need boundary — record links wrap text in the structured text field, so clicking opens that field editor.

### Non-Text Field Example

Fields without stega (numbers, booleans, dates, JSON): use `data-datocms-content-link-url` with `_editingUrl`:

```graphql
query {
  product {
    name
    price
    _editingUrl
  }
}
```

```vue
<template>
  <span :data-datocms-content-link-url="product._editingUrl">
    ${{ product.price }}
  </span>
</template>
```

### CSP Header for Web Previews Visual Tab

Nuxt handles CORS via `routeRules`. For CSP (Visual tab iframe), add route rule to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  // ... existing config ...
  routeRules: {
    '/api/**': { cors: true },
    '/**': {
      headers: {
        'Content-Security-Policy': "frame-ancestors 'self' https://plugins-cdn.datocms.com",
      },
    },
  },
});
```

### Stega Stripping

Content Link embeds invisible chars in text fields. Use `stripStega()` from `@datocms/content-link` before string comparisons, SEO metadata, analytics, URL generation from stega-carrying text. DatoCMS `slug` field type never carries stega — use directly. See `content-link-concepts.md`.

### Content Link Environment Variables

```
NUXT_PUBLIC_DATOCMS_BASE_EDITING_URL=   # For Content Link, e.g. https://your-project.admin.datocms.com/environments/main
```

### Content Link Dependencies

- `@datocms/content-link` — Click-to-edit overlays, stega utilities

## Real-Time Updates (Optional)

### Query Composable with Real-Time Subscription

Replace Core `useQuery` with real-time subscription version:

**File:** `composables/useQuery.ts`

```ts
import type { AsyncData } from '#app';
import { buildRequestInit } from '@datocms/cda-client';
import type { TadaDocumentNode } from 'gql.tada';
import { hash } from 'ohash';
import { useQuerySubscription } from 'vue-datocms';

const isServer = typeof window === 'undefined';

type Options<Variables> = {
  variables?: Variables;
};

export async function useQuery<Result, Variables>(
  query: TadaDocumentNode<Result, Variables>,
  options?: Options<Variables>,
) {
  const config = useRuntimeConfig();
  const draftMode = useDraftMode();

  const apiToken = draftMode
    ? draftMode.datocmsDraftContentCdaToken
    : config.public.datocmsPublishedContentCdaToken;

  if (!apiToken) {
    throw new Error('Missing API token');
  }

  const initialData = await useFetch('https://graphql.datocms.com/', {
    ...buildRequestInit(query, {
      token: apiToken,
      includeDrafts: Boolean(draftMode),
      excludeInvalid: true,
      variables: options?.variables,
    }),
    key: hash([query, options]),
    transform: (response: { data: Result; errors?: any[] }) => {
      if (response.errors)
        throw new Error(
          `Something went wrong while executing the query: ${JSON.stringify(response.errors)}`,
        );
      return response.data;
    },
  });

  if (!draftMode || isServer) {
    return initialData.data;
  }

  return useQuerySubscription<Result, Variables>({
    query,
    variables: options?.variables,
    token: apiToken,
    initialData: (initialData as AsyncData<Result, null>).data.value,
    includeDrafts: true,
    excludeInvalid: true,
  }).data;
}
```

Key points:

- Draft mode ON + client-side: `useQuerySubscription` from `vue-datocms`
- Draft mode OFF or server-side: return data directly

**Note: Combining with Content Link** — Add `contentLink` and `baseEditingUrl` to `buildRequestInit` options (see Content Link section).

### Real-Time Dependencies

- `vue-datocms` — `useQuerySubscription` composable

## Cache Tags (Optional)

CDN-first cache tag invalidation. Forwards DatoCMS cache tags to CDN; purges affected pages when content changes.

### When to Use

- Nuxt deployed behind CDN with tag-based purging (Netlify, Cloudflare, Fastly, Bunny)
- Per-record cache invalidation granularity needed

For webhook payload/CDN header table: `skills/datocms-cda/references/draft-caching-environments.md` → "Cache Tags".

### Modified Query Composable

Switch `executeQuery` → `rawExecuteQuery` to access `x-cache-tags` header. Returns data + cache tags:

**File:** `composables/useQueryWithCacheTags.ts`

```ts
import { rawExecuteQuery } from '@datocms/cda-client';
import type { TadaDocumentNode } from 'gql.tada';

type Options<Variables> = {
  variables?: Variables;
};

export async function useQueryWithCacheTags<Result, Variables>(
  query: TadaDocumentNode<Result, Variables>,
  options?: Options<Variables>,
) {
  const config = useRuntimeConfig();

  const [data, response] = await rawExecuteQuery(query, {
    token: config.public.datocmsPublishedContentCdaToken,
    excludeInvalid: true,
    variables: options?.variables,
    returnCacheTags: true,
  });

  const cacheTags = response.headers.get('x-cache-tags') ?? '';

  return { data, cacheTags };
}
```

Or use `rawExecuteQuery` directly in Nuxt server route/middleware:

**File:** `server/middleware/cache-tags.ts` (example pattern)

```ts
import { rawExecuteQuery } from '@datocms/cda-client';
import type { TadaDocumentNode } from 'gql.tada';

export async function fetchWithCacheTags<Result, Variables>(
  query: TadaDocumentNode<Result, Variables>,
  variables?: Variables,
) {
  const config = useRuntimeConfig();

  const [data, response] = await rawExecuteQuery(query, {
    token: config.public.datocmsPublishedContentCdaToken,
    excludeInvalid: true,
    variables,
    returnCacheTags: true,
  });

  const cacheTags = response.headers.get('x-cache-tags') ?? '';

  return { data, cacheTags };
}
```

### Setting CDN Headers

Set CDN-specific header on response in server routes/pages:

```ts
// In a server route (server/api/...)
export default eventHandler(async (event) => {
  const { data, cacheTags } = await fetchWithCacheTags(myQuery);

  // Set the CDN-specific header — choose the one matching your CDN:
  // Netlify / Cloudflare: 'Cache-Tag'
  // Fastly:               'Surrogate-Key'
  // Bunny:                'CDN-Tag'
  setResponseHeader(event, 'Cache-Tag', cacheTags);

  return data;
});
```

For pages with `useResponseHeaders` in Nitro:

```ts
// In a Nuxt page or layout (server-side rendering)
const { data, cacheTags } = await fetchWithCacheTags(myQuery);

// In server middleware or via useRequestEvent():
const event = useRequestEvent();
if (event) {
  setResponseHeader(event, 'Cache-Tag', cacheTags);
}
```

### Webhook Handler

**File:** `server/api/invalidate-cache.ts`

Receives DatoCMS cache tag invalidation webhook, calls CDN purge API:

```ts
import { ensureHttpMethods } from '~/lib/api/utils';

export default eventHandler(async (event) => {
  ensureHttpMethods(event, 'POST');

  const config = useRuntimeConfig();

  const authHeader = getHeader(event, 'authorization');
  if (authHeader !== `Bearer ${config.cacheInvalidationWebhookSecret}`) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody(event);
  const tags: string[] = body?.entity?.attributes?.tags ?? [];

  if (tags.length === 0) {
    return { purged: false };
  }

  // Call your CDN's purge API. Example for Fastly:
  //
  // await fetch(`https://api.fastly.com/service/${config.fastlyServiceId}/purge`, {
  //   method: 'POST',
  //   headers: {
  //     'Fastly-Key': config.fastlyKey,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ surrogate_keys: tags }),
  // });
  //
  // For Netlify, Cloudflare, or Bunny, use their respective purge APIs.

  return { purged: true, tags };
});
```

### Nuxt Config Cache Tags Addition

Add webhook secret + CDN vars to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    // ... existing config ...
    // set by NUXT_CACHE_INVALIDATION_WEBHOOK_SECRET env variable
    cacheInvalidationWebhookSecret: '',
    // CDN-specific (example for Fastly):
    // set by NUXT_FASTLY_SERVICE_ID env variable
    // fastlyServiceId: '',
    // set by NUXT_FASTLY_KEY env variable
    // fastlyKey: '',
  },
});
```

### Cache Tags Environment Variables

```
NUXT_CACHE_INVALIDATION_WEBHOOK_SECRET=   # Shared secret to verify webhook requests
# CDN-specific vars (uncomment for your CDN):
# NUXT_FASTLY_SERVICE_ID=                 # Fastly service ID
# NUXT_FASTLY_KEY=                        # Fastly API key
```

### Cache Tags Dependencies

None — `rawExecuteQuery` from `@datocms/cda-client` (already installed).
