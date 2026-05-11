# Vue Structured Text — `<datocms-structured-text>`

Vue 3 component for rendering DatoCMS [Structured Text (DAST)](https://www.datocms.com/docs/structured-text/dast) fields.

## Contents

- Setup
- Basic Usage
- Full GraphQL Fragment
- Custom Renderers
- Custom Node Rules
- Custom Mark Rules
- DAST Node Reference
- Conditional Rendering with `isEmptyDocument`
- Related Packages
- Props Reference
- Content Link Integration
- Project Wrapper Component
- Link-to-Record Component Shape

## Setup

Register globally:

```js
import { DatocmsStructuredTextPlugin } from 'vue-datocms';

app.use(DatocmsStructuredTextPlugin);
```

Or use locally:

```vue
<script setup>
import { StructuredText } from 'vue-datocms';
</script>
```

## Basic Usage

For simple Structured Text fields (no blocks, links, or inline records), query only `value`:

```vue
<script setup>
import { StructuredText } from 'vue-datocms';

const props = defineProps<{ data: any }>();
</script>

<template>
  <div>
    <h1>{{ data.blogPost.title }}</h1>
    <StructuredText :data="data.blogPost.content" />
  </div>
</template>
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

**Critical:** Always include `id` and `__typename` on every `links`, `blocks`, and `inlineBlocks` entry via `... on RecordInterface`. The component uses `__typename` for the switch statements in custom renderers.

## Custom Renderers

Use `renderBlock`, `renderInlineRecord`, `renderLinkToRecord`, and `renderInlineBlock` to handle embedded content. Renderers use Vue's `h()` function. Always switch on `record.__typename`:

```vue
<script setup>
import { StructuredText, Image } from 'vue-datocms';
import { h } from 'vue';

const props = defineProps<{ data: any }>();

function renderBlock({ record }) {
  switch (record.__typename) {
    case 'ImageBlockRecord':
      return h(Image, { data: record.image.responsiveImage });
    case 'CtaRecord':
      return h('a', { class: 'button', href: record.url }, record.title);
    default:
      return null;
  }
}

function renderInlineRecord({ record }) {
  switch (record.__typename) {
    case 'TeamMemberRecord':
      return h('a', { href: `/team/${record.slug}` }, record.firstName);
    default:
      return null;
  }
}

function renderLinkToRecord({ record, children, transformedMeta }) {
  switch (record.__typename) {
    case 'TeamMemberRecord':
      return h(
        'a',
        { ...transformedMeta, href: `/team/${record.slug}` },
        children,
      );
    default:
      return null;
  }
}

function renderInlineBlock({ record }) {
  switch (record.__typename) {
    case 'MentionRecord':
      return h('code', `@${record.username}`);
    default:
      return null;
  }
}
</script>

<template>
  <StructuredText
    :data="data.blogPost.content"
    :renderBlock="renderBlock"
    :renderInlineRecord="renderInlineRecord"
    :renderLinkToRecord="renderLinkToRecord"
    :renderInlineBlock="renderInlineBlock"
  />
</template>
```

## Custom Node Rules

Override default rendering for any node type using `customNodeRules` with `renderNodeRule`. Import type guards from `datocms-structured-text-utils`.

In Vue, the `renderNodeRule` callback receives `{ adapter: { renderNode: h }, node, children, key }` — use the adapter's `renderNode` as `h`:

```vue
<script setup>
import { StructuredText, renderNodeRule, renderMarkRule } from 'vue-datocms';
import { isHeading, isCode } from 'datocms-structured-text-utils';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';

const props = defineProps<{ data: any }>();

const customNodeRules = [
  // Add anchors to headings for in-page navigation
  renderNodeRule(isHeading, ({ adapter: { renderNode: h }, node, children, key }) => {
    const anchor = toPlainText(node)
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    return h(
      `h${node.level}`, { key }, [
        ...children,
        h('a', { id: anchor }, []),
        h('a', { href: `#${anchor}` }, []),
      ]
    );
  }),

  // Custom syntax highlighting for code blocks
  renderNodeRule(isCode, ({ adapter: { renderNode: h }, node, key }) => {
    return h('SyntaxHighlight', {
      key,
      code: node.code,
      language: node.language,
      linesToBeHighlighted: node.highlight,
    }, []);
  }),
];

const customMarkRules = [
  // Convert "strong" marks into <b> tags
  renderMarkRule('strong', ({ adapter: { renderNode: h }, children, key }) => {
    return h('b', { key }, children);
  }),
];
</script>

<template>
  <StructuredText
    :data="data.blogPost.content"
    :customNodeRules="customNodeRules"
    :customMarkRules="customMarkRules"
  />
</template>
```

Available type guards: `isHeading`, `isCode`, `isParagraph`, `isList`, `isListItem`, `isBlockquote`, `isLink`, `isRoot`, and more — see [datocms-structured-text-utils](https://github.com/datocms/structured-text/tree/main/packages/utils#typescript-type-guards).

**Note:** If you override the rules for `inlineItem`, `itemLink`, `block`, or `inlineBlock` nodes via `customNodeRules`, the corresponding `renderInlineRecord`, `renderLinkToRecord`, `renderBlock`, and `renderInlineBlock` props are ignored.

## Custom Mark Rules

Override how marks (bold, italic, etc.) render using `customMarkRules` with `renderMarkRule`:

```js
import { renderMarkRule } from 'vue-datocms';

const customMarkRules = [
  renderMarkRule('strong', ({ adapter: { renderNode: h }, children, key }) => {
    return h('b', { key }, children);
  }),
];
```

### Available Marks

| Mark | Default HTML tag | Description |
| - | - | - |
| `'strong'` | `<strong>` | Bold text |
| `'emphasis'` | `<em>` | Italic text |
| `'underline'` | `<u>` | Underlined text |
| `'strikethrough'` | `<s>` | Strikethrough text |
| `'highlight'` | `<mark>` | Highlighted text |
| `'code'` | `<code>` | Inline code |

## DAST Node Reference

Each node type in a Structured Text document has specific properties available in `renderNodeRule` callbacks:

| Node Type | Type Guard | Key Properties |
| - | - | - |
| Root | `isRoot` | `children` |
| Paragraph | `isParagraph` | `children`, `style` (optional custom style) |
| Heading | `isHeading` | `children`, `level` (1-6), `style` (optional) |
| List | `isList` | `children`, `style` (`'bulleted'` or `'numbered'`) |
| List Item | `isListItem` | `children` |
| Blockquote | `isBlockquote` | `children`, `attribution` (optional string) |
| Code | `isCode` | `code` (string), `language` (optional), `highlight` (optional line numbers array) |
| Thematic Break | `isThematicBreak` | _(no children)_ |
| Block | `isBlock` | `item` (record ID -- resolved via `blocks` array) |
| Inline Block | `isInlineBlock` | `item` (record ID -- resolved via `inlineBlocks` array) |
| Span | `isSpan` | `value` (text), `marks` (optional array of mark strings) |
| Link | `isLink` | `children`, `url`, `meta` (optional array of `{ id, value }`) |
| Item Link | `isItemLink` | `children`, `item` (record ID -- resolved via `links` array), `meta` (optional) |
| Inline Item | `isInlineItem` | `item` (record ID -- resolved via `links` array) |

## Conditional Rendering with `isEmptyDocument`

Use `isEmptyDocument()` to skip rendering when a Structured Text field is empty:

```vue
<script setup>
import { StructuredText } from 'vue-datocms';
import { isEmptyDocument } from 'datocms-structured-text-utils';

const props = defineProps<{ data: any }>();
</script>

<template>
  <div>
    <h1>{{ data.blogPost.title }}</h1>
    <StructuredText
      v-if="!isEmptyDocument(data.blogPost.content)"
      :data="data.blogPost.content"
    />
  </div>
</template>
```

## Related Packages

### `datocms-structured-text-to-plain-text`

Extract plain text from a DAST document (strips all formatting). Useful for generating heading anchors, meta descriptions, or search indexes:

```js
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';

const text = toPlainText(data.blogPost.content);
```

### `datocms-structured-text-to-html-string`

Render DAST to an HTML string server-side (non-Vue contexts, emails, RSS feeds):

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

Same customization API as `<StructuredText>` (`renderBlock`, `renderInlineRecord`, `renderLinkToRecord`, `renderInlineBlock`, `customNodeRules`, `customMarkRules`).

## Props Reference

| Prop | Type | Required | Description |
| - | - | - | - |
| `data` | `StructuredTextGraphQlResponse \| DastNode` | Yes | The structured text field value from DatoCMS |
| `renderBlock` | `({ record }) => VNode \| null` | Only if document has `block` nodes | Render embedded block records |
| `renderInlineRecord` | `({ record }) => VNode \| null` | Only if document has `inlineItem` nodes | Render inline record references |
| `renderLinkToRecord` | `({ record, children, transformedMeta }) => VNode \| null` | Only if document has `itemLink` nodes | Render links to other records |
| `renderInlineBlock` | `({ record }) => VNode \| null` | Only if document has `inlineBlock` nodes | Render inline block records |
| `metaTransformer` | `({ node, meta }) => Object \| null` | No | Transform link/itemLink `meta` into HTML props |
| `customNodeRules` | `Array<RenderRule>` | No | Custom node rendering rules (via `renderNodeRule()`) |
| `customMarkRules` | `Array<RenderMarkRule>` | No | Custom mark rendering rules (via `renderMarkRule()`) |
| `renderText` | `(text: string, key: string) => VNode \| string \| null` | No | Custom text node rendering |

## Content Link Integration

When using Visual Editing (Content Link), Structured Text fields require special data attributes. See the `vue-content-link.md` reference for details:

**Rule 1:** Always wrap `<StructuredText>` in a `data-datocms-content-link-group`:

```vue
<template>
  <div data-datocms-content-link-group>
    <StructuredText :data="page.content" />
  </div>
</template>
```

**Rule 2:** Add `data-datocms-content-link-boundary` on `renderBlock`, `renderInlineRecord`, and `renderInlineBlock` — but **NOT** on `renderLinkToRecord`:

```js
function renderBlock({ record }) {
  switch (record.__typename) {
    case 'ImageBlockRecord':
      return h(
        'div',
        { 'data-datocms-content-link-boundary': '' },
        [h(Image, { data: record.image.responsiveImage })],
      );
    default:
      return null;
  }
}

function renderInlineRecord({ record }) {
  switch (record.__typename) {
    case 'TeamMemberRecord':
      return h(
        'span',
        { 'data-datocms-content-link-boundary': '' },
        [h('a', { href: `/team/${record.slug}` }, record.firstName)],
      );
    default:
      return null;
  }
}

function renderLinkToRecord({ record, children, transformedMeta }) {
  switch (record.__typename) {
    case 'TeamMemberRecord':
      return h(
        'a',
        { ...transformedMeta, href: `/team/${record.slug}` },
        children,
      );
    default:
      return null;
  }
}

function renderInlineBlock({ record }) {
  switch (record.__typename) {
    case 'MentionRecord':
      return h(
        'span',
        { 'data-datocms-content-link-boundary': '' },
        [h('code', `@${record.username}`)],
      );
    default:
      return null;
  }
}
```

**Why `renderLinkToRecord` doesn't need a boundary:** Record links are `<a>` tags wrapping text that belongs to the surrounding structured text. They don't introduce a separate editing target, so no URL collision occurs.

## Project Wrapper Component

Don't import `<StructuredText />` from `vue-datocms` into pages directly — wrap once, use the wrapper everywhere. Conventionally exported as `<Text>` from `components/Text/index.vue` so it's visually distinct from the upstream component (and so Nuxt's auto-import doesn't shadow the named import inside the wrapper itself). Reasons:

- Every render needs `data-datocms-content-link-group` for Visual Editing — wrapper enforces it so no page can forget.
- Wrapper is the right place for project-wide `customNodeRules` (headings, code, etc.) so every structured-text field renders consistently without each caller restating them.

Forward every prop via `$attrs`; intercept only `customNodeRules` to merge defaults:

```vue
<!-- components/Text/index.vue -->
<template>
  <div data-datocms-content-link-group>
    <DatoStructuredText
      v-bind="$attrs"
      :customNodeRules="(mergedCustomNodeRules as any)"
    />
  </div>
</template>

<script setup lang="ts">
import { isCode, isHeading } from 'datocms-structured-text-utils';
import { StructuredText as DatoStructuredText, renderNodeRule } from 'vue-datocms';
import { HeadingWithAnchorLink, LazyCode } from '#components';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs() as { customNodeRules?: unknown[] };

const projectDefaultNodeRules = [
  renderNodeRule(isCode, ({ node, key }) => h(LazyCode, { key, node })),
  renderNodeRule(isHeading, ({ node, key, children }) =>
    h(HeadingWithAnchorLink, { node, key }, () => children),
  ),
];

const mergedCustomNodeRules = computed(() => [
  ...(attrs.customNodeRules ?? []),
  ...projectDefaultNodeRules,
]);
</script>
```

- **Why `inheritAttrs: false` + `$attrs` instead of `defineProps`?** Borrowing the upstream prop type via `defineProps<ExtractPublicPropTypes<typeof StructuredText>>()` looks clean but the Vue compiler can't generate runtime prop descriptors from a borrowed/computed type alias — `props.data` ends up `undefined` at runtime and the wrapper renders empty without any error. Forwarding `$attrs` sidesteps runtime registration entirely; cost is giving up call-site type-checking on the wrapper itself. Upstream component still type-checks its received props.
- **Alias the upstream component on import** — `import { StructuredText as DatoStructuredText }`. Nuxt auto-imports the wrapper as `<StructuredText>` if you name the file that way, so the alias avoids a name collision inside the wrapper's own `<script>`. (Also why the public component is named `<Text>`.)
- **Prepend caller's rules**, not append — earlier rules win, so caller-supplied rules must come first to take precedence over project defaults.
- Heavy / client-only node renderers should use Nuxt's `Lazy*` prefix (`LazyCode`, `LazyBlocksVideoBlock`, …) so they aren't pulled into the page's initial JS bundle.

## Link-to-Record Component Shape

Link-to-record components have a different prop signature than blocks/inline records — `{ record, transformedMeta }` plus default `<slot />` for the link's children:

```vue
<!-- components/linkToRecords/PageLink/index.vue -->
<template>
  <NuxtLink v-bind="transformedMeta" :href="buildUrlForPage(unmaskedRecord)">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { TransformedMeta } from 'datocms-structured-text-generic-html-renderer';
import { buildUrlForPage } from '~/lib/datocms/gqlUrlBuilder/page';
import { type FragmentOf, readFragment } from '~/lib/datocms/graphql';
import { PageLinkFragment } from './fragments';

const props = defineProps<{
  record: FragmentOf<typeof PageLinkFragment>;
  transformedMeta: TransformedMeta;
}>();

const unmaskedRecord = readFragment(PageLinkFragment, props.record);
</script>
```

The page's `renderLinkToRecord` callback bridges the renderer-supplied `children` array to Vue's slot:

```ts
const renderLinkToRecord = ({ record, children, transformedMeta }) => {
  switch (record.__typename) {
    case 'PageRecord':
      return h(LinkToRecordsPageLink, { record, transformedMeta }, () => children);
  }
};
```

- **No `data-datocms-content-link-boundary`** on link-to-record components — renderer handles those boundaries. Inline-record components _do_ set it themselves.
- **`v-bind="transformedMeta"`** so renderer-provided attributes (`target`, `rel`, …) are honored. `TransformedMeta` is `{ [k: string]: unknown } | null | undefined`; `v-bind` handles the nullable cases.
