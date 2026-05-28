# SvelteKit — Draft Mode Reference

This reference contains the exact code patterns for implementing draft mode in a SvelteKit project with DatoCMS. Sections are organized by feature — always follow `## Core`, then follow optional sections only for features the user selected.

## Contents

- Core
- Web Previews (Optional)
- Content Link (Optional)
- Real-Time Updates (Optional)
- Cache Tags (Optional)

## Core

### File Structure

```
src/routes/api/
├── draft-mode/
│   ├── enable/+server.ts
│   └── disable/+server.ts
└── utils.ts
src/lib/
├── draftMode.server.ts
└── datocms/
    └── queries.ts            (modify existing or create)
```

### Enable Endpoint

**File:** `src/routes/api/draft-mode/enable/+server.ts`

```ts
import { env } from '$env/dynamic/private';
import { enableDraftMode } from '$lib/draftMode.server';
import { redirect } from '@sveltejs/kit';
import { handleUnexpectedError, invalidRequestResponse, isRelativeUrl } from '../../utils';
import type { RequestHandler } from './$types';

/**
 * This route handler enables Draft Mode and redirects to the given URL.
 */
export const GET: RequestHandler = (event) => {
  const { url } = event;

  const token = url.searchParams.get('token');
  const redirectUrl = url.searchParams.get('redirect') || '/';

  try {
    if (token !== env.PRIVATE_SECRET_API_TOKEN) {
      return invalidRequestResponse('Invalid token', 401);
    }

    if (!isRelativeUrl(redirectUrl)) {
      return invalidRequestResponse('URL must be relative!', 422);
    }

    enableDraftMode(event);
  } catch (error) {
    return handleUnexpectedError(error);
  }

  redirect(307, redirectUrl);
};
```

Key points:

- Uses `$env/dynamic/private` for environment variables
- Uses SvelteKit's `redirect(307, url)` for redirects
- Exports `GET` as a `RequestHandler`

### Disable Endpoint

**File:** `src/routes/api/draft-mode/disable/+server.ts`

```ts
import { disableDraftMode } from '$lib/draftMode.server';
import { redirect } from '@sveltejs/kit';
import { handleUnexpectedError, invalidRequestResponse, isRelativeUrl } from '../../utils';
import type { RequestHandler } from './$types';

/**
 * This route handler disables Draft Mode and redirects to the given URL.
 */
export const GET: RequestHandler = (event) => {
  const { url } = event;
  const redirectUrl = url.searchParams.get('redirect') || '/';

  try {
    if (!isRelativeUrl(redirectUrl)) {
      return invalidRequestResponse('URL must be relative!', 422);
    }

    disableDraftMode(event);
  } catch (error) {
    return handleUnexpectedError(error);
  }

  redirect(307, redirectUrl);
};
```

### Draft Mode Helper

**File:** `src/lib/draftMode.server.ts`

```ts
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { CookieSerializeOptions } from 'cookie';

/**
 * Generates a JSON Web Token (JWT) that is used as a signed cookie for
 * entering Draft Mode.
 */
function jwtToken() {
  return jwt.sign({ enabled: true }, env.PRIVATE_SIGNED_COOKIE_JWT_SECRET);
}

const DRAFT_MODE_COOKIE_SERIALIZE_OPTIONS: CookieSerializeOptions & { path: string } = {
  path: '/',
  partitioned: true,
  sameSite: 'none',
  secure: true,
  httpOnly: false,
};

/**
 * Sets the signed cookie required to enter Draft Mode.
 */
export function enableDraftMode(event: RequestEvent) {
  event.cookies.set(
    publicEnv.PUBLIC_DRAFT_MODE_COOKIE_NAME,
    jwtToken(),
    DRAFT_MODE_COOKIE_SERIALIZE_OPTIONS,
  );
}

/**
 * Disables Draft Mode by deleting the cookie.
 */
export function disableDraftMode(event: RequestEvent) {
  event.cookies.delete(
    publicEnv.PUBLIC_DRAFT_MODE_COOKIE_NAME,
    DRAFT_MODE_COOKIE_SERIALIZE_OPTIONS,
  );
}

/**
 * Checks if Draft Mode is enabled for a given request by verifying the JWT.
 */
export function isDraftModeEnabled(event: RequestEvent) {
  const cookie = event.cookies.get(publicEnv.PUBLIC_DRAFT_MODE_COOKIE_NAME);

  if (!cookie) {
    return false;
  }

  try {
    const payload = jwt.verify(cookie, env.PRIVATE_SIGNED_COOKIE_JWT_SECRET) as JwtPayload;
    return payload.enabled as boolean;
  } catch (e) {
    return false;
  }
}

/**
 * Returns the HTTP headers needed to enable Draft Mode.
 */
export function draftModeHeaders(): HeadersInit {
  return {
    Cookie: `${publicEnv.PUBLIC_DRAFT_MODE_COOKIE_NAME}=${jwtToken()};`,
  };
}
```

Key points:

- JWT payload is `{ enabled: true }` (simpler than Nuxt, which stores the draft token in the JWT)
- Private env vars from `$env/dynamic/private`, public from `$env/dynamic/public`
- Cookie options type includes `& { path: string }` because SvelteKit's cookie API requires `path`
- `httpOnly: false` — the cookie needs to be readable by client-side JavaScript for draft mode detection

### Utils

**File:** `src/routes/api/utils.ts`

```ts
import { json } from '@sveltejs/kit';
import { serializeError } from 'serialize-error';

export function withCORS(responseInit?: ResponseInit): ResponseInit {
  return {
    ...responseInit,
    headers: {
      ...responseInit?.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  };
}

export function handleUnexpectedError(error: unknown) {
  try {
    throw error;
  } catch (e) {
    console.error(e);
  }

  return invalidRequestResponse(serializeError(error), 500);
}

export function invalidRequestResponse(error: unknown, status = 422) {
  return json(
    {
      success: false,
      error,
    },
    withCORS({ status }),
  );
}

export function successfulResponse(data?: unknown, status = 200) {
  return json(
    {
      success: true,
      data,
    },
    withCORS({ status }),
  );
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

- Uses `json()` from `@sveltejs/kit` instead of `NextResponse.json()` or raw `Response`
- Same `withCORS`, `handleUnexpectedError`, `isRelativeUrl` pattern as other frameworks

### Query Function

**File:** `src/lib/datocms/queries.ts`

This is the main query helper for fetching DatoCMS content with draft mode support.

```ts
import { env as privateEnv } from '$env/dynamic/private';
import { isDraftModeEnabled } from '$lib/draftMode.server';
import { executeQuery } from '@datocms/cda-client';
import type { RequestEvent } from '@sveltejs/kit';
import type { TadaDocumentNode } from 'gql.tada';

/**
 * Executes a GraphQL query against the DatoCMS CDA, automatically
 * switching between published and draft tokens based on draft mode.
 *
 * Use in `+page.server.ts` load functions.
 */
export async function performQuery<Result, Variables>(
  event: RequestEvent,
  query: TadaDocumentNode<Result, Variables>,
  variables?: Variables,
) {
  const draftModeEnabled = isDraftModeEnabled(event);

  return executeQuery(query, {
    variables,
    includeDrafts: draftModeEnabled,
    excludeInvalid: true,
    token: draftModeEnabled
      ? privateEnv.PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN
      : privateEnv.PRIVATE_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN,
  });
}
```

### Usage in `+page.server.ts`

```ts
import { performQuery } from '$lib/datocms/queries';
import { myQuery } from './query';

export async function load(event) {
  return {
    data: await performQuery(event, myQuery),
  };
}
```

### Core Environment Variables

```
PRIVATE_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN=   # Published content CDA token
PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN=       # Draft content CDA token (with "Include drafts")
PRIVATE_SECRET_API_TOKEN=                       # Shared secret for endpoint auth
PRIVATE_SIGNED_COOKIE_JWT_SECRET=               # JWT signing secret
PUBLIC_DRAFT_MODE_COOKIE_NAME=                  # Cookie name, e.g. "datocms-draft-mode"
```

SvelteKit convention:

- `PRIVATE_` prefix → only available server-side (`$env/dynamic/private`)
- `PUBLIC_` prefix → available on both server and client (`$env/dynamic/public`)

### Core Dependencies

Required (install if missing):

- `jsonwebtoken` — For signing/verifying JWT cookies
- `@types/jsonwebtoken` — TypeScript types (dev dependency)
- `serialize-error` — For serializing error objects

Optional for Web Previews helpers:

- `@datocms/cma-client` — For `RawApiTypes`

## Web Previews (Optional)

### Preview Links Endpoint

**File:** `src/routes/api/preview-links/+server.ts`

```ts
import { env as privateEnv } from '$env/dynamic/private';
import { recordToWebsiteRoute } from '$lib/datocms/recordInfo';
import { json } from '@sveltejs/kit';
import { handleUnexpectedError, invalidRequestResponse, withCORS } from '../utils';
import type { RequestHandler } from './$types';

export const OPTIONS: RequestHandler = ({ request }) => {
  return new Response('OK', withCORS());
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
export const POST: RequestHandler = async ({ url, request }) => {
  try {
    const token = url.searchParams.get('token');

    if (token !== privateEnv.PRIVATE_SECRET_API_TOKEN) {
      return invalidRequestResponse('Invalid token', 401);
    }

    const { item, itemType, locale } = await request.json();

    const recordUrl = recordToWebsiteRoute(item, itemType.id, locale);

    const response: WebPreviewsResponse = { previewLinks: [] };

    if (recordUrl) {
      if (item.meta.status !== 'published') {
        response.previewLinks.push({
          label: 'Draft version',
          url: new URL(
            `/api/draft-mode/enable?redirect=${recordUrl}&token=${token}`,
            request.url,
          ).toString(),
        });
      }

      if (item.meta.status !== 'draft') {
        response.previewLinks.push({
          label: 'Published version',
          url: new URL(
            `/api/draft-mode/disable?redirect=${recordUrl}`,
            request.url,
          ).toString(),
        });
      }
    }

    return json(response, withCORS());
  } catch (error) {
    return handleUnexpectedError(error);
  }
};
```

Key points:

- Receives `itemType` in the body and passes `itemType.id` to `recordToWebsiteRoute`
- Uses `redirect` as the query parameter name (same as Next.js)

### `recordToWebsiteRoute`

**File:** `src/lib/datocms/recordInfo.ts`

Requires `cma-types` — generated types expose `Schema.X.ID` (literal-typed model id) and the `AnyModel` union, which discriminates `item.attributes` per branch.

```ts
import type { RawApiTypes } from '@datocms/cma-client';
import * as Schema from '$lib/datocms/cma-types';

/**
 * Maps a DatoCMS record to its frontend URL. Used by the preview-links endpoint.
 */
export function recordToWebsiteRoute(
  item: RawApiTypes.Item<Schema.AnyModel>,
  itemTypeId: string,
  locale: string,
): string | null {
  switch (itemTypeId) {
    // Replace with your project's models. Each `case Schema.X.ID` narrows
    // `item.attributes` to that model's fields — no `as` casts needed.
    //
    // case Schema.Page.ID:
    //   return `/${item.attributes.slug}`;
    //
    // case Schema.BlogPost.ID:
    //   return `/blog/${item.attributes.slug}`;

    default:
      return null;
  }
}
```

### Web Previews Dependencies

No additional dependencies beyond what Core requires.

## Content Link (Optional)

### Query Function Content Link Addition

Modify the `performQuery` function from the Core section to add Content Link support. Add these two options inside the `executeQuery` call:

```ts
contentLink: draftModeEnabled ? 'v1' : undefined,
baseEditingUrl: draftModeEnabled ? privateEnv.PRIVATE_DATOCMS_BASE_EDITING_URL : undefined,
```

The full query function with Content Link enabled:

```ts
import { env as privateEnv } from '$env/dynamic/private';
import { isDraftModeEnabled } from '$lib/draftMode.server';
import { executeQuery } from '@datocms/cda-client';
import type { RequestEvent } from '@sveltejs/kit';
import type { TadaDocumentNode } from 'gql.tada';

export async function performQuery<Result, Variables>(
  event: RequestEvent,
  query: TadaDocumentNode<Result, Variables>,
  variables?: Variables,
) {
  const draftModeEnabled = isDraftModeEnabled(event);

  return executeQuery(query, {
    variables,
    includeDrafts: draftModeEnabled,
    excludeInvalid: true,
    token: draftModeEnabled
      ? privateEnv.PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN
      : privateEnv.PRIVATE_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN,
    contentLink: draftModeEnabled ? 'v1' : undefined,
    baseEditingUrl: draftModeEnabled ? privateEnv.PRIVATE_DATOCMS_BASE_EDITING_URL : undefined,
  });
}
```

### ContentLink Component Setup

Create a Svelte component that initializes Content Link with routing support for the Web Previews Visual tab:

**File:** `src/lib/components/ContentLink.svelte`

```svelte
<script lang="ts">
  import { createController } from '@datocms/content-link';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  let controller: ReturnType<typeof createController> | null = null;

  onMount(() => {
    controller = createController({
      onNavigateTo: (path) => {
        goto(path);
      },
    });
    controller.enableClickToEdit();

    return () => {
      controller?.dispose();
      controller = null;
    };
  });

  $effect(() => {
    controller?.setCurrentPath(page.url.pathname);
  });
</script>
```

Then add it to your root layout (`src/routes/+layout.svelte`), only rendering when draft mode is enabled:

```svelte
<script lang="ts">
  import ContentLink from '$lib/components/ContentLink.svelte';

  let { data, children } = $props();
</script>

{#if data.isDraftMode}
  <ContentLink />
{/if}

{@render children()}
```

Pass `isDraftMode` from `+layout.server.ts`:

```ts
import { isDraftModeEnabled } from '$lib/draftMode.server';

export async function load(event) {
  return {
    isDraftMode: isDraftModeEnabled(event),
  };
}
```

### Structured Text with Content Link

When rendering Structured Text fields with `@datocms/svelte`, wrap the component in a group and add boundaries to embedded blocks and inline records:

```svelte
<script lang="ts">
  import { StructuredText } from '@datocms/svelte';
  import { stripStega } from '@datocms/content-link';
  import BlockComponent from './BlockComponent.svelte';
  import InlineRecordComponent from './InlineRecordComponent.svelte';

  let { page } = $props();
</script>

<div data-datocms-content-link-group>
  <StructuredText
    data={page.content}
    components={[
      [isBlock, BlockComponent],
      [isInlineItem, InlineRecordComponent],
    ]}
  />
</div>
```

For the block and inline record components, add the boundary attribute at the component level:

**`BlockComponent.svelte`:**

```svelte
<script lang="ts">
  let { record } = $props();
</script>

<div data-datocms-content-link-boundary>
  <!-- Block content here -->
</div>
```

**`InlineRecordComponent.svelte`:**

```svelte
<script lang="ts">
  let { record } = $props();
</script>

<span data-datocms-content-link-boundary>
  <!-- Inline record content here -->
</span>
```

Note: `renderLinkToRecord` does **not** need a boundary — record links wrap text that belongs to the structured text field, so clicking them correctly opens the structured text field editor.

### Non-Text Field Example

For fields that cannot contain stega encoding (numbers, booleans, dates, JSON), use `data-datocms-content-link-url` with the record's `_editingUrl`:

```graphql
query {
  product {
    name
    price
    _editingUrl
  }
}
```

```svelte
<span data-datocms-content-link-url={product._editingUrl}>
  ${product.price}
</span>
```

### CSP Header for Web Previews Visual Tab

To allow your site to be loaded in the Web Previews Visual tab iframe, add a Content-Security-Policy header in `src/hooks.server.ts`:

```ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://plugins-cdn.datocms.com",
  );

  return response;
};
```

### Stega Stripping

Content Link embeds invisible characters in text fields. Use `stripStega()` from `@datocms/content-link` before string comparisons, SEO metadata, analytics, or URL generation from stega-carrying text. DatoCMS `slug` field type never carries stega — use directly. See `content-link-concepts.md` for full details and field-type exception list.

### Content Link Environment Variables

```
PRIVATE_DATOCMS_BASE_EDITING_URL=              # For Content Link
```

### Content Link Dependencies

- `@datocms/content-link` — For click-to-edit overlays and stega utilities

## Real-Time Updates (Optional)

### `generateRealtimeSubscription`

Replace the Core `performQuery` function with this version that returns subscription options for real-time updates when draft mode is enabled:

**File:** `src/lib/datocms/queries.ts`

```ts
import { env as privateEnv } from '$env/dynamic/private';
import { isDraftModeEnabled } from '$lib/draftMode.server';
import { executeQuery } from '@datocms/cda-client';
import type { QuerySubscriptionOptions } from '@datocms/svelte';
import type { RequestEvent } from '@sveltejs/kit';
import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';

/**
 * Returns options required to initialize real-time subscriptions to draft
 * content using the `querySubscription` store from @datocms/svelte.
 *
 * Use in `+page.server.ts` load functions.
 */
export async function generateRealtimeSubscription<Result, Variables>(
  event: RequestEvent,
  query: TadaDocumentNode<Result, Variables>,
  variables?: Variables,
): Promise<QuerySubscriptionOptions<Result, Variables>> {
  const draftModeEnabled = isDraftModeEnabled(event);

  const data = await executeQuery(query, {
    variables,
    includeDrafts: draftModeEnabled,
    excludeInvalid: true,
    token: draftModeEnabled
      ? privateEnv.PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN
      : privateEnv.PRIVATE_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN,
  });

  // If Draft Mode is not active, return the data without subscription
  if (!draftModeEnabled) {
    return {
      enabled: false,
      initialData: data,
    };
  }

  // Enable the subscription, passing all options needed for the client
  return {
    enabled: true,
    query: print(query),
    variables,
    initialData: data,
    token: privateEnv.PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN,
    includeDrafts: true,
    excludeInvalid: true,
  };
}
```

**Note: Combining with Content Link** — If the user also selected Content Link, add these options to both the `executeQuery` call and the returned subscription config:

```ts
contentLink: draftModeEnabled ? 'v1' : undefined,
baseEditingUrl: draftModeEnabled ? privateEnv.PRIVATE_DATOCMS_BASE_EDITING_URL : undefined,
```

### Usage in `+page.server.ts`

```ts
import { generateRealtimeSubscription } from '$lib/datocms/queries';
import { myQuery } from './query';

export async function load(event) {
  return {
    subscription: await generateRealtimeSubscription(event, myQuery),
  };
}
```

### Usage in `+page.svelte`

```svelte
<script lang="ts">
  import { querySubscription } from '@datocms/svelte';

  let { data } = $props();
  const { data: result } = querySubscription(data.subscription);
</script>

{#if $result}
  <!-- Render your content using $result -->
{/if}
```

Key points:

- When draft mode is OFF: returns `{ enabled: false, initialData: data }` — no subscription, just static data
- When draft mode is ON: returns full subscription config including serialized `query` (via `print()` from `graphql`), `token`, `variables`
- Uses `@datocms/svelte`'s `querySubscription` store on the client

### Real-Time Dependencies

- `@datocms/svelte` — For `querySubscription` store
- `graphql` — For `print()` to serialize queries (needed by subscription)

## Cache Tags (Optional)

CDN-first cache tag invalidation for SvelteKit. Instead of revalidating all content on every change, this forwards DatoCMS cache tags to your CDN, which purges only the affected pages when content changes.

### When to Use

- Your SvelteKit site is deployed behind a CDN that supports tag-based purging (Netlify, Cloudflare, Fastly, Bunny)
- You want per-record granularity in cache invalidation

For the webhook payload structure and CDN header table, see `skills/datocms-cda/references/draft-caching-environments.md` → "Cache Tags".

### Modified Query Function

Switch from `executeQuery` to `rawExecuteQuery` to access the `x-cache-tags` response header:

**File:** `src/lib/datocms/queries.ts`

```ts
import { env as privateEnv } from '$env/dynamic/private';
import { isDraftModeEnabled } from '$lib/draftMode.server';
import { rawExecuteQuery } from '@datocms/cda-client';
import type { RequestEvent } from '@sveltejs/kit';
import type { TadaDocumentNode } from 'gql.tada';

export async function performQueryWithCacheTags<Result, Variables>(
  event: RequestEvent,
  query: TadaDocumentNode<Result, Variables>,
  variables?: Variables,
) {
  const draftModeEnabled = isDraftModeEnabled(event);

  const [data, response] = await rawExecuteQuery(query, {
    variables,
    includeDrafts: draftModeEnabled,
    excludeInvalid: true,
    token: draftModeEnabled
      ? privateEnv.PRIVATE_DATOCMS_DRAFT_CONTENT_CDA_TOKEN
      : privateEnv.PRIVATE_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN,
    returnCacheTags: true,
  });

  const cacheTags = response.headers.get('x-cache-tags') ?? '';

  return { data, cacheTags };
}
```

### Setting CDN Headers

In `+page.server.ts` or `+layout.server.ts`, use `setHeaders()` to set the CDN-specific header:

```ts
import { performQueryWithCacheTags } from '$lib/datocms/queries';
import { myQuery } from './query';

export async function load(event) {
  const { data, cacheTags } = await performQueryWithCacheTags(event, myQuery);

  // Set the CDN-specific header — choose the one matching your CDN:
  // Netlify / Cloudflare: 'Cache-Tag'
  // Fastly:               'Surrogate-Key'
  // Bunny:                'CDN-Tag'
  event.setHeaders({
    'Cache-Tag': cacheTags,
  });

  return { data };
}
```

### Webhook Handler

**File:** `src/routes/api/invalidate-cache/+server.ts`

Receives the DatoCMS cache tag invalidation webhook and calls your CDN's purge API:

```ts
import { env as privateEnv } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${privateEnv.PRIVATE_CACHE_INVALIDATION_WEBHOOK_SECRET}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const tags: string[] = body?.entity?.attributes?.tags ?? [];

  if (tags.length === 0) {
    return json({ purged: false });
  }

  // Call your CDN's purge API. Example for Fastly:
  //
  // await fetch(`https://api.fastly.com/service/${privateEnv.PRIVATE_FASTLY_SERVICE_ID}/purge`, {
  //   method: 'POST',
  //   headers: {
  //     'Fastly-Key': privateEnv.PRIVATE_FASTLY_KEY,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ surrogate_keys: tags }),
  // });
  //
  // For Netlify, Cloudflare, or Bunny, use their respective purge APIs.

  return json({ purged: true, tags });
};
```

### Cache Tags Environment Variables

```
PRIVATE_CACHE_INVALIDATION_WEBHOOK_SECRET=   # Shared secret to verify webhook requests
# CDN-specific vars (uncomment for your CDN):
# PRIVATE_FASTLY_SERVICE_ID=                 # Fastly service ID
# PRIVATE_FASTLY_KEY=                        # Fastly API key
```

### Cache Tags Dependencies

No additional dependencies — `rawExecuteQuery` is provided by `@datocms/cda-client` which should already be installed.
