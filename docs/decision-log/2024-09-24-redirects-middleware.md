# Redirects middleware

[Previous decision](./2024-01-20-editable-redirects.md) was to use Cloudflare
Pages to handle redirects. An upgrade to Cloudflare adapter broke this
implementation. Using middleware is more reliable and removes Cloudflare
lock-in.

- Date: 2024-09-24
- Alternatives Considered: compile to [Astro redirects](https://docs.astro.build/en/reference/configuration-reference/#redirects);
- Decision Made By: [Jasper](https://github.com/jbmoelker)

## Decision

### Middleware for redirects
Middleware is unit-tested and has no dependencies on external services.

### Astro redirects
Astro also offers functionality to handle redirects: [Astro redirects](https://docs.astro.build/en/reference/configuration-reference/#redirects).
However Astro redirects do not support wildcards and the redirect destination
in Astro redirects configuration requires knowledge of the avalable file-based
routes in the code base which content editors in the CMS don't have.
