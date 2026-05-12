# Svelte Structured Text — `<StructuredText />`

Svelte component for rendering DatoCMS [Structured Text (DAST)](https://www.datocms.com/docs/structured-text/dast) fields.

## Contents

- Basic Usage
- Full GraphQL Fragment
- Custom Components (Predicate-Component Tuples)
- Custom Node Rendering
- DAST Node Reference
- Conditional Rendering with `isEmptyDocument`
- Related Packages
- Props Reference
- Content Link Integration
- Project Wrapper Component
- Item-Link Component Shape

## Basic Usage

For simple Structured Text fields (no blocks, links, or inline records), query only `value`:

```svelte
<script>
  import { StructuredText } from '@datocms/svelte';

  const { data } = $props();
</script>

<div>
  <h1>{data.blogPost.title}</h1>
  <StructuredText data={data.blogPost.content} />
</div>
```

```graphql
query {
  blogPost {
    title
    content {
      value
    }
  }
}
```

## Full GraphQL Fragment

When using blocks, inline records, links, or inline blocks, query the full shape:

```graphql
query {
  blogPost {
    content {
      value
      links {
        ... on RecordInterface {
          id
          __typename
        }
        ... on TeamMemberRecord {
          firstName
          slug
        }
      }
      blocks {
        ... on RecordInterface {
          id
          __typename
        }
        ... on ImageBlockRecord {
          image {
            responsiveImage(imgixParams: { auto: format }) {
              src
              width
              height
              alt
              base64
            }
          }
        }
        ... on CtaRecord {
          title
          url
        }
      }
      inlineBlocks {
        ... on RecordInterface {
          id
          __typename
        }
        ... on MentionRecord {
          username
        }
      }
    }
  }
}
```

**Critical:** Always include `id` and `__typename` on every `links`, `blocks`, and `inlineBlocks` entry via `... on RecordInterface`. The component uses `__typename` for matching in custom component renderers.

## Custom Components (Predicate-Component Tuples)

Unlike React (render props) and Vue (`h()` render functions), Svelte uses **separate `.svelte` component files** paired with **predicate functions** from `datocms-structured-text-utils`. Pass them as an array of tuples via the `components` prop:

```svelte
<script>
  import { StructuredText } from '@datocms/svelte';
  import { isBlock, isInlineItem, isItemLink, isInlineBlock } from 'datocms-structured-text-utils';

  import Block from './Block.svelte';
  import InlineItem from './InlineItem.svelte';
  import ItemLink from './ItemLink.svelte';
  import InlineBlock from './InlineBlock.svelte';

  const { data } = $props();
</script>

<StructuredText
  data={data.blogPost.content}
  components={[
    [isBlock, Block],
    [isInlineBlock, InlineBlock],
    [isInlineItem, InlineItem],
    [isItemLink, ItemLink],
  ]}
/>
```

### Block Component Example

Custom block components receive `block` as a prop (the resolved record from the `blocks` array):

```svelte
<!-- Block.svelte -->
<script>
  import { Image } from '@datocms/svelte';

  const { block } = $props();
</script>

{#if block.__typename === 'ImageBlockRecord'}
  <Image data={block.image.responsiveImage} />
{:else if block.__typename === 'CtaRecord'}
  <a class="button" href={block.url}>{block.title}</a>
{/if}
```

### Inline Item Component Example

Inline item components receive `link` as a prop (the resolved record from the `links` array):

```svelte
<!-- InlineItem.svelte -->
<script>
  const { link } = $props();
</script>

{#if link.__typename === 'TeamMemberRecord'}
  <a href={`/team/${link.slug}`}>{link.firstName}</a>
{/if}
```

### Item Link Component Example

Item link components receive `link` as a prop and render children via `<slot />`:

```svelte
<!-- ItemLink.svelte -->
<script>
  const { link } = $props();
</script>

{#if link.__typename === 'TeamMemberRecord'}
  <a href={`/team/${link.slug}`}>
    <slot />
  </a>
{/if}
```

### Inline Block Component Example

Inline block components receive `block` as a prop (the resolved record from the `inlineBlocks` array):

```svelte
<!-- InlineBlock.svelte -->
<script>
  const { block } = $props();
</script>

{#if block.__typename === 'MentionRecord'}
  <code>@{block.username}</code>
{/if}
```

## Custom Node Rendering

Override default rendering for any node type using predicate-component tuples with type guards from `datocms-structured-text-utils`:

```svelte
<script>
  import { StructuredText } from '@datocms/svelte';
  import { isHeading, isCode } from 'datocms-structured-text-utils';

  import Heading from './Heading.svelte';
  import Code from './Code.svelte';

  const { data } = $props();
</script>

<StructuredText
  data={data.blogPost.content}
  components={[
    [isHeading, Heading],
    [isCode, Code],
  ]}
/>
```

### Custom Heading Example

Custom node components receive a `node` prop with the DAST node data:

```svelte
<!-- Heading.svelte -->
<script>
  import { render as toPlainText } from 'datocms-structured-text-to-plain-text';

  const { node } = $props();

  $: anchor = toPlainText(node)
    ?.toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
</script>

<svelte:element this={`h${node.level}`}>
  <slot />
  <a id={anchor} />
  <a href={`#${anchor}`}>#</a>
</svelte:element>
```

### Custom Code Block Example

```svelte
<!-- Code.svelte -->
<script>
  const { node } = $props();
</script>

<pre class="code-block" data-language={node.language}>
  <code>{node.code}</code>
</pre>
```

Available type guards: `isHeading`, `isCode`, `isParagraph`, `isList`, `isListItem`, `isBlockquote`, `isLink`, `isRoot`, and more — see [datocms-structured-text-utils](https://github.com/datocms/structured-text/tree/main/packages/utils#typescript-type-guards).

**Note:** If you override the rules for `inlineItem`, `itemLink`, `block`, or `inlineBlock` nodes via `components`, these take precedence over any other tuples for those node types.

## DAST Node Reference

Each node type in a Structured Text document has specific properties available in custom components:

| Node Type | Type Guard | Key Properties |
| - | - | - |
| Root | `isRoot` | `children` |
| Paragraph | `isParagraph` | `children`, `style` (optional custom style) |
| Heading | `isHeading` | `children`, `level` (1–6), `style` (optional) |
| List | `isList` | `children`, `style` (`'bulleted'` or `'numbered'`) |
| List Item | `isListItem` | `children` |
| Blockquote | `isBlockquote` | `children`, `attribution` (optional string) |
| Code | `isCode` | `code` (string), `language` (optional), `highlight` (optional line numbers array) |
| Thematic Break | `isThematicBreak` | _(no children)_ |
| Block | `isBlock` | `item` (record ID — resolved via `blocks` array) |
| Inline Block | `isInlineBlock` | `item` (record ID — resolved via `inlineBlocks` array) |
| Span | `isSpan` | `value` (text), `marks` (optional array of mark strings) |
| Link | `isLink` | `children`, `url`, `meta` (optional array of `{ id, value }`) |
| Item Link | `isItemLink` | `children`, `item` (record ID — resolved via `links` array), `meta` (optional) |
| Inline Item | `isInlineItem` | `item` (record ID — resolved via `links` array) |

## Conditional Rendering with `isEmptyDocument`

Use `isEmptyDocument()` to skip rendering when a Structured Text field is empty (contains only a single empty paragraph):

```svelte
<script>
  import { StructuredText } from '@datocms/svelte';
  import { isEmptyDocument } from 'datocms-structured-text-utils';

  const { data } = $props();
</script>

<div>
  <h1>{data.blogPost.title}</h1>
  {#if !isEmptyDocument(data.blogPost.content)}
    <StructuredText data={data.blogPost.content} />
  {/if}
</div>
```

## Related Packages

### `datocms-structured-text-to-plain-text`

Extract plain text from a DAST document (strips all formatting). Useful for generating heading anchors, meta descriptions, or search indexes:

```js
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';

const text = toPlainText(data.blogPost.content);
// "Hello world! This is my blog post."
```

### `datocms-structured-text-to-html-string`

Render DAST to an HTML string server-side (non-framework contexts, emails, RSS feeds):

```js
import { render as toHtml } from 'datocms-structured-text-to-html-string';

const html = toHtml(data.blogPost.content, {
  renderBlock: ({ record }) => {
    switch (record.__typename) {
      case 'ImageBlockRecord':
        return `<img src="${record.image.url}" alt="${record.image.alt}" />`;
      default:
        return null;
    }
  },
});
```

## Props Reference

| Prop | Type | Required | Description |
| - | - | - | - |
| `data` | `StructuredText \| DastNode` | Yes | The structured text field value from DatoCMS |
| `components` | `PredicateComponentTuple[]` | Only if document has `block`, `inlineBlock`, `inlineItem`, or `itemLink` nodes | Array of `[predicate, SvelteComponent]` tuples for custom rendering |

## Content Link Integration

When using Visual Editing (Content Link), Structured Text fields require special data attributes to make click-to-edit work correctly:

**Rule 1:** Always wrap `<StructuredText>` in a `data-datocms-content-link-group`:

```svelte
<div data-datocms-content-link-group>
  <StructuredText data={page.content} />
</div>
```

**Rule 2:** Add `data-datocms-content-link-boundary` on block, inline block, and inline item components — but **NOT** on item link components:

```svelte
<!-- Block.svelte -->
<script>
  const { block } = $props();
</script>

<div data-datocms-content-link-boundary>
  <h2>{block.title}</h2>
  <p>{block.description}</p>
</div>
```

```svelte
<!-- InlineBlock.svelte -->
<script>
  const { block } = $props();
</script>

<span data-datocms-content-link-boundary>
  <em>{block.username}</em>
</span>
```

```svelte
<!-- InlineItem.svelte -->
<script>
  const { link } = $props();
</script>

<span data-datocms-content-link-boundary>
  {link.title}
</span>
```

```svelte
<!-- ItemLink.svelte (NO boundary needed) -->
<script>
  const { link } = $props();
</script>

<a href={`/posts/${link.slug}`}>
  <slot />
</a>
```

**Why item link components don't need a boundary:** Record links are `<a>` tags wrapping text that belongs to the surrounding structured text. They don't introduce a separate editing target, so no URL collision occurs.

## Project Wrapper Component

Don't import `<StructuredText />` from `@datocms/svelte` into pages directly — wrap once, use the wrapper everywhere. Conventionally exported as `<Text>` from `src/lib/components/Text/index.svelte` so it's visually distinct from the upstream component at call sites. Reasons:

- Every render needs `data-datocms-content-link-group` for Visual Editing — wrapper enforces it so no page can forget.
- Wrapper bakes in **what's universal to every structured-text rendering** — generic node overrides for code blocks, heading anchors, etc. Per-field concerns (block / inline-record / link-to-record renderers, which depend on which models a given structured-text field accepts) stay in the route and are passed in via `components`:

```svelte
<!-- src/lib/components/Text/index.svelte -->
<script lang="ts">
  import {
    StructuredText as DatoStructuredText,
    type PredicateComponentTuple,
  } from '@datocms/svelte';
  import { isCode, isHeading } from 'datocms-structured-text-utils';
  import type { ComponentProps } from 'svelte';
  import Code from '$lib/components/Code/index.svelte';
  import HeadingWithAnchorLink from '$lib/components/HeadingWithAnchorLink/index.svelte';

  type Props = ComponentProps<DatoStructuredText>;

  let { components = [], ...rest }: Props = $props();

  const defaultComponents: PredicateComponentTuple[] = [
    [isCode, Code],
    [isHeading, HeadingWithAnchorLink],
  ];

  let mergedComponents = $derived([...components, ...defaultComponents]);
</script>

<div data-datocms-content-link-group>
  <DatoStructuredText {...rest} components={mergedComponents} />
</div>
```

- **Borrow upstream prop shape** with `ComponentProps<DatoStructuredText>` — wrapper transparently accepts everything `<StructuredText />` does (`data`, `components`, plus any future prop) without keeping a hand-written list in sync. Type takes the _instance_ (`DatoStructuredText`), not the constructor (`typeof DatoStructuredText`): Svelte 5's `ComponentProps<T>` is constrained on `T extends SvelteComponent<...> | Component<...>`.
- **Prepend caller's components**, not append — `Node.svelte` resolves the first matching tuple in `[...components, ...DEFAULT_COMPONENTS]`, so caller-supplied tuples must come first to take precedence over project defaults.
- Heavy / async-loadable node renderers should use `{#await import(...)}` so they aren't pulled into the page's initial JS bundle:
  ```svelte
  {#await import('./VideoBlock/index.svelte') then VideoBlock}
    <VideoBlock.default data={unmaskedBlock} />
  {/await}
  ```

Per-field components stay in the page — what a structured-text field can embed varies field by field (one field accepts `ImageBlockRecord`, another doesn't; one allows inline records, another doesn't):

```svelte
<!-- src/routes/page/[slug]/+page.svelte -->
<script lang="ts">
  import { isBlock, isInlineItem, isItemLink } from 'datocms-structured-text-utils';
  import Text from '$lib/components/Text/index.svelte';
  import Block from '$lib/components/Block/index.svelte';
  import InlineItem from '$lib/components/InlineItem/index.svelte';
  import ItemLink from '$lib/components/ItemLink/index.svelte';
</script>

<Text
  data={page.structuredText}
  components={[
    [isBlock, Block],
    [isInlineItem, InlineItem],
    [isItemLink, ItemLink],
  ]}
/>
```

## Item-Link Component Shape

Item-link components have a different prop signature than blocks / inline records — `{ node, link, children }` (children as `Snippet`):

```svelte
<!-- src/lib/components/ItemLink/index.svelte -->
<script lang="ts">
  import type { ItemLink } from 'datocms-structured-text-utils';
  import { defaultMetaTransformer } from 'datocms-structured-text-generic-html-renderer';
  import { readFragment, type FragmentOf } from '$lib/datocms/graphql';
  import { buildUrlForPage } from '$lib/datocms/gqlUrlBuilder/page';
  import { ItemLinkFragment } from './fragments';
  import type { Snippet } from 'svelte';

  interface Props {
    node: ItemLink;
    link: FragmentOf<typeof ItemLinkFragment>;
    children: Snippet;
  }

  let { node, link, children }: Props = $props();
  let unmaskedLink = $derived(readFragment(ItemLinkFragment, link));

  let { meta } = $derived(node);
  let transformedMeta = $derived(meta ? defaultMetaTransformer({ node, meta }) : null);
</script>

{#if unmaskedLink.__typename === 'PageRecord'}
  <a {...transformedMeta} href={buildUrlForPage(unmaskedLink)}>
    {@render children()}
  </a>
{/if}
```

Three differences from React/Astro:

- **No `data-datocms-content-link-boundary`** on item-link components — renderer handles those boundaries. Inline-item components _do_ set it themselves.
- **`@datocms/svelte` does not pre-compute `transformedMeta`.** Component receives the raw DAST `node` (typed as `ItemLink`) and runs `defaultMetaTransformer({ node, meta })` from `datocms-structured-text-generic-html-renderer` itself. Spread `{...transformedMeta}` so renderer-provided attributes (`target`, `rel`, …) are honored.
- Children come in as a `Snippet`, rendered with `{@render children()}`.
