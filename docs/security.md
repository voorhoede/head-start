# Security

**Head Start sends a baseline of security headers with every response, protects on-demand routes against cross-site form submissions and keeps secrets on the server.**

## Security headers

| Header | Value | Why |
| --- | --- | --- |
| `Content-Security-Policy` | `frame-ancestors 'self' https://*.admin.datocms.com https://plugins-cdn.datocms.com` | Only the site and the DatoCMS editor (web previews, plugins) may frame pages. Replaces `X-Frame-Options`. |
| `Permissions-Policy` | `camera=(), geolocation=(), microphone=(), payment=(), usb=()` | Denies browser features the site doesn't use. Features embeds request via their iframe `allow` attribute (fullscreen, autoplay, picture-in-picture, ...) stay allowed. |
| `Referrer-Policy` | `no-referrer-when-downgrade` | No referrer from HTTPS to HTTP. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS only, for two years. |
| `X-Content-Type-Options` | `nosniff` | Browsers trust the declared content type. |
| `X-XSS-Protection` | `1; mode=block` | Legacy, for old browsers. |

The headers are set in **two places that must stay in sync**:

- [`public/_headers`](../public/_headers) for static files (prerendered pages and assets).
- [`src/middleware/security-headers.ts`](../src/middleware/security-headers.ts) for on-demand rendered responses (`prerender = false`), which never pass through `_headers`.

**Exception:** `/cms/editor-guide/` is embedded by the DatoCMS "Custom Page" plugin from any DatoCMS host, so it sends `frame-ancestors 'self' https://*.datocms.com` and `X-Robots-Tag: noindex`.

Check the headers with `curl -sI <url>` or [securityheaders.com](https://securityheaders.com/).

## Cross-site request protection

Astro's [`security.checkOrigin`](https://docs.astro.build/en/reference/configuration-reference/#securitycheckorigin) (default, made explicit in [`astro.config.ts`](../astro.config.ts)) rejects cross-origin form submissions (`POST`, `PUT`, `PATCH`, `DELETE`) to on-demand routes. Head Start's own forms use `GET`, and the JSON requests of the DatoCMS Web Previews plugin to `/api/preview-links/` are not affected.

## Secrets

Tokens and `HEAD_START_PREVIEW_SECRET` are only read on the server via `astro:env/server`. Never log them or return them from an API route. See [Preview Mode](./preview-mode.md) for how the preview secret is used.

## Not (yet) in place

- **Full Content Security Policy** (`script-src`, `style-src`, ...): Head Start uses inline scripts and third-party embeds, so this needs nonces or hashes and a frame allowlist per project. Start with `Content-Security-Policy-Report-Only`.
- **Subresource Integrity:** all scripts are same-origin, content-hashed bundles, so it adds little.

See [#216](https://github.com/voorhoede/head-start/issues/216) for other candidate measures.
