# Content from content collections only

**The production site reads all content from content collections, so it doesn't depend on DatoCMS at runtime.**

- Date: 2026-10-22
- Alternatives Considered: translations as a content collection; Astro live collections for preview
- Decision Made By: [Jasper](https://github.com/jbmoelker)

## Decision

All content rendered on the site (App, HomePage, NotFoundPage, Pages, PagePartials) is loaded through content collections in [`src/content/`](../../src/content/), read with `~/lib/content`. Pages rendered on demand in production (like 404) then no longer query DatoCMS. The preview Worker still loads entries live.

This improves performance (no CMS round trips at runtime) and security (the production site needs no DatoCMS API access, except for the exceptions below).

Config and UI strings (locales, translations, redirects, file proxy map) stay JSON files downloaded on `prep`. They are needed synchronously, in middleware or in client-side scripts, where content collections are unavailable. They have no runtime DatoCMS dependency either.

Exceptions:
- `/api/reroute/` queries DatoCMS directly, as it's only used for links from DatoCMS, including to draft records.
- Search still uses DatoCMS Site Search, to be replaced separately.
- Images and files are still served from DatoCMS assets. A possible follow-up is serving them from an R2 bucket.
