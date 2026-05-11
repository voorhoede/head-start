# gql.tada Fragment Patterns

Discipline for writing/organizing GraphQL queries when project uses `gql.tada` (see `type-generation.md` for setup). Apply only when project already follows these conventions — don't impose on projects that use plain `executeQuery` strings or codegen with hand-shaped types.

## Contents

- Co-locate fragment with component
- Mask by default — `@_unmask` is the exception
- `readFragment()` at the component boundary
- Fragment composition — imports mirror spreads
- Spreading fragments inside union/interface selections
- One query per page composed from sub-component fragments

## Co-locate fragment with component

Every block / inline-record / link-to-record component lives next to its fragment definition. Same shape every time so contributors copy a known pattern instead of designing a new one. Two consequences:

- Pages import the fragment from the component's location — never reach into field shapes.
- New block / inline-record / link-to-record = copy a known shape.

File-split is project choice (`Component.tsx` + `fragments.ts`, both in one file, `index.{tsx,vue,svelte,astro}` + sibling `fragments.ts`, etc.) — pick one and keep it uniform.

## Mask by default — `@_unmask` is the exception

Every component fragment is **masked**: `gql.tada` returns opaque `FragmentOf<typeof XxxFragment>` to callers; component unmasks via `readFragment()`. Parent query just spreads `...XxxFragment` and never touches the inner shape.

Use `@_unmask` **only** when fragment is a true partial reused inside multiple sibling fragments (shared meta tags, common "card" projection used by next/previous queries):

```ts
fragment TagFragment on Tag @_unmask { tag attributes content }
```

Reaching for `@_unmask` to "make data easier to access" → smell. Pass the masked fragment to a component that owns the unmask instead.

## `readFragment()` at the component boundary

Every component using a fragment unmasks at its boundary. One prop, typed as `FragmentOf<typeof XxxFragment>` — never the unmasked shape. Keeps call site type-safe across schema changes.

```ts
import { type FragmentOf, readFragment } from 'gql.tada';
import { CtaButtonFragment } from './fragments';

type Props = { block: FragmentOf<typeof CtaButtonFragment> };

// inside component:
const block = readFragment(CtaButtonFragment, props.block);
```

Same prop name across each category so contributors don't read the type to know what to pass. Renderer-dictated names take precedence (e.g. `react-datocms` → `data` for blocks via `renderBlock`; `@datocms/svelte` → `block`/`link` from `Node.svelte`).

URL builders and other helpers accepting fragments follow the same boundary rule — accept masked fragment, unmask internally.

## Fragment composition — imports mirror spreads

Compose fragments instead of re-declaring fields. Every nested fragment spread in the GraphQL string **must** also be passed in the composition array (second arg to `graphql(...)`) — required for `gql.tada` to type-resolve. Forgetting one or the other is the most common gql.tada bug.

```ts
import { ResponsiveImageFragment } from '~/components/ResponsiveImage/fragments';

export const ImageBlockFragment = graphql(
  /* GraphQL */ `
    fragment ImageBlockFragment on ImageBlockRecord {
      asset {
        responsiveImage(sizes: "...") { ...ResponsiveImageFragment }
      }
    }
  `,
  [ResponsiveImageFragment],
);
```

Add `...FooFragment` to the GraphQL string → add `FooFragment` to imports and composition array. Two-step rule, no exceptions.

## Spreading fragments inside union/interface selections

Fragment spreads carry their own type condition. A fragment defined on `ImageBlockRecord` only matches when runtime type is `ImageBlockRecord`, even when spread directly inside a union selection — no need to wrap in `... on ImageBlockRecord { ... }`.

```graphql
blocks {
  ... on RecordInterface {  # inline selections, NOT a fragment spread
    id
    __typename
  }
  ...ImageBlockFragment
  ...ImageGalleryBlockFragment
  ...VideoBlockFragment
}
```

`... on RecordInterface { id __typename }` stays — inline selections, not fragment spread. `... on ImageBlockRecord { ...ImageBlockFragment }` is redundant — write `...ImageBlockFragment` directly. Same applies inside a fragment defined on a concrete type — wrapping `... on PageRecord { … }` inside `fragment … on PageRecord` is meaningless.

## One query per page composed from sub-component fragments

Every route declares a single GraphQL query composing the fragment exported by each block / inline-record / link-to-record component it renders. Query location is project choice (inline in page, sibling `query.ts`, `+page.server.ts`, etc.) — what matters: page's data needs described in one place by composing fragments, not re-declaring fields.

```ts
const query = graphql(
  /* GraphQL */ `
    query BasicPageQuery($slug: String!) {
      page(filter: { slug: { eq: $slug } }) {
        _seoMetaTags { ...TagFragment }
        title
        structuredText {
          value
          blocks {
            ... on RecordInterface { id __typename }
            ...ImageBlockFragment
            ...VideoBlockFragment
          }
          links {
            ... on RecordInterface { id __typename }
            ...PageInlineFragment
            ...PageLinkFragment
          }
        }
      }
    }
  `,
  [TagFragment, ImageBlockFragment, VideoBlockFragment, PageInlineFragment, PageLinkFragment],
);
```

Layering style is free: a page can spread one umbrella `BlockFragment` that itself spreads `ImageBlockFragment`, `VideoBlockFragment`, etc. Either is fine — rule is **fields are not re-declared anywhere**, only fragments spread.
