# Draft Mode Concepts

Reference for implementing draft mode across frameworks.

## Contents

- Overview
- Token Validation Pattern
- Open Redirect Prevention
- Cookie Attributes for Iframe Support
- Query Function Modification
- Error Handling
- Environment Variables
- JWT-Based Draft Mode (Nuxt, SvelteKit, Astro)

## Overview

Draft mode lets editors preview unpublished content. Uses two tokens:

- **Published Content CDA Token** — production queries, published content only
- **Draft Content CDA Token** — draft mode, returns unpublished + published

Flow: enable endpoint receives secret token → sets draft cookie → redirects → query function detects draft mode → switches to draft token with `includeDrafts: true`.

## Token Validation Pattern

Enable endpoint validates requests via shared secret:

```ts
// Parse query string parameters
const token = request.searchParams.get('token');

// Ensure that the request is coming from a trusted source
if (token !== SECRET_API_TOKEN) {
  // Return 401 unauthorized
}
```

`SECRET_API_TOKEN` is a random string in env vars. Not a DatoCMS token — shared secret between app and DatoCMS.

**Important:** Disable endpoint needs NO token validation. Just removes cookie and redirects. Safe because it only reduces access.

## Open Redirect Prevention

Validate redirect URLs are relative to prevent open redirect vulnerabilities:

```ts
function isRelativeUrl(path: string): boolean {
  try {
    // Try to create a URL object — if it succeeds without a base, it's absolute
    new URL(path);
    return false;
  } catch {
    try {
      // Verify it can be parsed as a relative URL by providing a base
      new URL(path, 'http://example.com');
      return true;
    } catch {
      // If both attempts fail, it's not a valid URL at all
      return false;
    }
  }
}
```

Use in every endpoint that redirects:

```ts
const redirectUrl = request.searchParams.get('redirect') || '/';

if (!isRelativeUrl(redirectUrl)) {
  // Return 422 - "URL must be relative!"
}
```

## Cookie Attributes for Iframe Support

DatoCMS loads your site in an iframe. Third-party cookies need specific attributes:

- **`partitioned: true`** — CHIPS (Cookies Having Independent Partitioned State), separate cookie jar per top-level site
- **`sameSite: 'none'`** — cross-site context (your site in DatoCMS iframe)
- **`secure: true`** — required when `sameSite` is `'none'`

Must set on all cookie operations (set, delete) for draft mode.

### Next.js Special Case

Next.js `draftMode()` API sets `__prerender_bypass` cookie but NOT `partitioned`. Rewrite after `draft.enable()` or `draft.disable()`:

```ts
async function makeDraftModeWorkWithinIframes() {
  const cookie = (await cookies()).get('__prerender_bypass')!;

  (await cookies()).set({
    name: '__prerender_bypass',
    value: cookie?.value,
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none',
    partitioned: true,
  });
}
```

### Other Frameworks (Nuxt, SvelteKit, Astro)

These frameworks use a custom cookie with a JWT token. The cookie attributes are set directly when creating/deleting the cookie.

## Query Function Modification

Modify `executeQuery` wrapper (or create one):

1. Accept `includeDrafts` option
2. Switch tokens: `true` → Draft CDA Token, `false`/`undefined` → Published CDA Token
3. Always set `excludeInvalid: true`

```ts
const result = await executeQuery(query, {
  variables: options?.variables,
  excludeInvalid: true,
  includeDrafts: options?.includeDrafts,
  token: options?.includeDrafts
    ? DRAFT_CDA_TOKEN
    : PUBLISHED_CDA_TOKEN,
});
```

## Error Handling

Catch errors with shared `handleUnexpectedError` utility:

```ts
import { serializeError } from 'serialize-error';

function handleUnexpectedError(error: unknown) {
  try {
    throw error;
  } catch (e) {
    console.error(e);
  }

  // Return 500 with serializeError(error)
}
```

Logs error, serializes to response-safe shape. Requires `serialize-error` package.

## Environment Variables

Core env variables (names vary by framework):

| Variable | Description | Where to find it |
| - | - | - |
| Published Content CDA Token | Read-only token for published content | DatoCMS → Settings → API tokens → Create with "Published" access |
| Draft Content CDA Token | Read-only token for draft content | DatoCMS → Settings → API tokens → Create with "Include drafts" checked |
| Secret API Token | Shared secret for endpoint authentication | Generate with `openssl rand -hex 32` |
| Signed Cookie JWT Secret | Secret for signing the draft mode JWT cookie (non-Next.js only) | Generate with `openssl rand -hex 32` |
| Draft Mode Cookie Name | Name of the draft mode cookie (non-Next.js only) | Choose any name, e.g., `datocms-draft-mode` |

Next.js doesn't need JWT secret or cookie name — uses built-in `draftMode()` with `__prerender_bypass` cookie.

## JWT-Based Draft Mode (Nuxt, SvelteKit, Astro)

JWT-signed cookie for frameworks without built-in draft mode:

### Enable

1. Sign JWT with draft mode state (e.g., `{ enabled: true }` or `{ datocmsDraftContentCdaToken: '...' }`)
2. Set as cookie with CHIPS-compatible attributes

### Disable

1. Delete cookie (same attributes)

### Check

1. Read cookie
2. Verify JWT signature
3. Return payload's `enabled` state (falsy if missing/invalid)

JWT secret must be strong random string in env vars.

**Nuxt difference:** Stores actual draft CDA token in JWT payload (`{ datocmsDraftContentCdaToken: '...' }`) for client-side real-time subscriptions. SvelteKit and Astro use simpler `{ enabled: true }` payload, keep token server-side only.
