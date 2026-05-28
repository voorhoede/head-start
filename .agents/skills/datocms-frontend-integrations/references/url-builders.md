# Per-Model URL Builders + `buildUrlFromGql()` Dispatcher

Pattern for "given a record, what is its URL" when project uses `gql.tada` (see `datocms-cda/references/fragment-patterns.md` for masking discipline). Apply when project already has `lib/datocms/gqlUrlBuilder/` (or similar) — don't impose otherwise.

## Contents

- One file per routable model
- Fragment composition (Inline / Link → Url)
- `buildUrlFromGql()` discriminated-union dispatcher
- Adding a new routable model

## One file per routable model

For every routable model: one file under `lib/datocms/gqlUrlBuilder/<model>.ts` (Astro/Nuxt) or `src/lib/datocms/gqlUrlBuilder/<model>.ts` (Next.js/SvelteKit). Exports a fragment + a builder.

```ts
// src/lib/datocms/gqlUrlBuilder/page.ts
import { type FragmentOf, graphql, readFragment } from '~/lib/datocms/graphql';

export const PageUrlFragment = graphql(/* GraphQL */ `
  fragment PageUrlFragment on PageRecord {
    slug
  }
`);

export function buildUrlForPage(page: FragmentOf<typeof PageUrlFragment>) {
  const data = readFragment(PageUrlFragment, page);
  return `/page/${data.slug}`;
}
```

Rules:

- **Always declare a fragment**, even when URL only needs `slug`. Callers compose the fragment, not raw fields. URL grows to `/page/[year]/[slug]` → fragment grows; callers don't change.
- **Builder accepts masked fragment, unmasks internally** — same boundary discipline as components.
- **Fragment is self-contained** — builder never issues another query. Non-trivial work (walk parent backref, resolve a hierarchy, etc.) lives in the fragment:

```ts
fragment DocPageUrlFragment on DocPageRecord {
  slug
  parent: _allReferencingDocGroups { slug }
}
```

```ts
fragment DocGroupUrlFragment on DocGroupRecord {
  slug
  pagesOrSections: pages {
    __typename
    ... on DocGroupPageRecord { page { slug } }
    ... on DocGroupSectionRecord { pages { page { slug } } }
  }
}
```

### One canonical URL per record

Pattern presumes one canonical URL per record. If the same record renders at multiple demo URLs (e.g. `/basic/page/[slug]` + `/real-time-updates/[slug]`), pick one canonical URL the builder returns — inline/link records embedded inside structured text rendered under another route will route the visitor to the canonical one. Trade-off is intentional: every record has _one_ URL, the URL builder is the only place that knows it.

## Fragment composition (Inline / Link → Url)

Inline-record and link-to-record fragments **compose** the corresponding URL fragment, never re-declare slug fields:

```ts
// components/inlineRecords/PageInline/fragments.ts
import { PageUrlFragment } from '~/lib/datocms/gqlUrlBuilder/page';
import { graphql } from '~/lib/datocms/graphql';

export const PageInlineFragment = graphql(
  /* GraphQL */ `
    fragment PageInlineFragment on PageRecord {
      title
      ...PageUrlFragment
    }
  `,
  [PageUrlFragment],
);
```

Then component imports `buildUrlForPage` and passes unmasked record straight through:

```tsx
const unmaskedRecord = readFragment(PageInlineFragment, record);
<Link href={buildUrlForPage(unmaskedRecord)} data-datocms-content-link-boundary>
  {unmaskedRecord.title}
</Link>
```

Rule: **inline/link component owns visual representation; URL builder owns routing**. They meet via fragment composition. No component re-implements URL logic; no URL builder is given a hand-shaped object.

Composing requires every nested fragment in the second arg (composition array) — see `datocms-cda/references/fragment-patterns.md`.

## `buildUrlFromGql()` discriminated-union dispatcher

`lib/datocms/gqlUrlBuilder/index.ts` exports a single `buildUrlFromGql(record)` accepting `(FragmentOf<typeof XxxUrlFragment> & { __typename: 'XxxRecord' })` from union of all routable models. Dispatches via `switch (record.__typename)`. Use any time generic record-handling code (related-content cards, search-result items) renders a link without knowing the type at compile time.

```ts
// src/lib/datocms/gqlUrlBuilder/index.ts
type RoutableRecord =
  | (FragmentOf<typeof PageUrlFragment> & { __typename: 'PageRecord' })
  | (FragmentOf<typeof BlogPostUrlFragment> & { __typename: 'BlogPostRecord' });

export function buildUrlFromGql(thing: RoutableRecord): string {
  switch (thing.__typename) {
    case 'PageRecord':
      return buildUrlForPage(thing);
    case 'BlogPostRecord':
      return buildUrlForBlogPost(thing);
  }
}
```

**Callers must select `__typename` themselves.** Per-model URL fragments don't declare `__typename` (not part of URL data). Any query feeding `buildUrlFromGql()` spreads the URL fragment **and** selects `__typename` — typically via project's `... on RecordInterface { id __typename }` inline selection. Forgetting this is the most common dispatcher type error.

## Adding a new routable model

1. Add `gqlUrlBuilder/<newModel>.ts` exporting `<NewModel>UrlFragment` + `buildUrlFor<NewModel>()`.
2. Add a case in `gqlUrlBuilder/index.ts` and a member in the `RoutableRecord` union.
3. Compose `<NewModel>UrlFragment` from any inline-record / link-to-record / card fragments that link to it.
