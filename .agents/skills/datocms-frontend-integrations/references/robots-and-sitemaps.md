# Robots and Sitemaps for DatoCMS Search

Use this reference when generating `robots.txt`, `sitemap.xml`, sitemap indexes, or section-specific crawling rules for DatoCMS-powered sites.

## Contents

- DatoCMS crawler behavior
- Order matters
- Sitemaps
- User-agent suffixes
- Shared mapping contract
- Framework route shapes

## DatoCMS crawler behavior

DatoCMS Site Search uses its own crawler:

- Default user agent: `DatoCmsSearchBot`
- Optional per-index suffixes produce user agents like `DatoCmsSearchBotDocs`
- Supported robots directives: `User-agent`, `Allow`, `Disallow`
- Supported matching helpers: `*` wildcard and `$` end-of-path marker
- Unsupported: `crawl-delay`, page-level `nofollow`, page-level `noindex`
- Unsupported: multiple robots groups for the same user agent

## Order matters

DatoCMS respects the **first matching** `Allow` or `Disallow` rule for a URL. Put every allowed section before a catch-all `Disallow: /`.

Correct pattern:

```txt
User-agent: DatoCmsSearchBot
Allow: /blog/
Allow: /docs/
Disallow: /
```

Incorrect pattern:

```txt
User-agent: DatoCmsSearchBot
Allow: /blog/
Disallow: /
Allow: /docs/
```

In the incorrect version, `/docs/` is still blocked because `Disallow: /` matches first.

## Sitemaps

The crawler:

- reads `Sitemap:` directives in `robots.txt`
- falls back to `/sitemap.xml` if no explicit sitemap directive exists
- supports sitemap index files as well as normal sitemaps
- ignores URLs outside the configured frontend domain

Sitemap generation rules:

- emit absolute URLs
- keep every URL on the same domain as the configured public site URL
- include stable `lastmod` values when you have them
- use a sitemap index only when you truly emit multiple sitemap documents

## User-agent suffixes

Search indexes can define a `user_agent_suffix`. If an index uses the suffix `Docs`, the crawler user agent becomes `DatoCmsSearchBotDocs`.

This lets you split large sites into separate search indexes, each with its own allowed section:

```txt
User-agent: DatoCmsSearchBotDocs
Allow: /docs/
Disallow: /

User-agent: DatoCmsSearchBotBlog
Allow: /blog/
Disallow: /
```

Only generate suffix-specific groups when the project already uses multiple search indexes or the repo clearly exposes distinct public sections that can be mapped without guessing.

## Shared mapping contract

Keep sitemap generation deterministic by centralizing route logic:

- one helper that turns records or route entries into absolute public URLs
- one source list describing which sections feed the sitemap
- one `lastmod` strategy per source

A practical contract looks like:

```ts
type SitemapSource = {
  id: string;
  pathnamePrefix: string;
  fetchEntries: () => Promise<Array<{
    path: string;
    lastModified: string | null;
  }>>;
};
```

If any public model is missing a URL builder or `lastmod` source, keep the setup result `scaffolded`.

## Framework route shapes

Use the framework's native route mechanism:

| Framework | Robots route | Sitemap route |
| - | - | - |
| Next.js App Router | `app/robots.ts` | `app/sitemap.ts` or section-specific route handlers |
| Nuxt | `server/routes/robots.txt.ts` | `server/routes/sitemap.xml.ts` |
| SvelteKit | `src/routes/robots.txt/+server.ts` | `src/routes/sitemap.xml/+server.ts` |
| Astro | `src/pages/robots.txt.ts` | `src/pages/sitemap.xml.ts` |

Prefer framework-native helpers when they exist. Use raw XML/text responses only when the framework does not expose a structured metadata route.
