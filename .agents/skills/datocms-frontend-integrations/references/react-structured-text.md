# React Structured Text — `<StructuredText />`

React component for rendering DatoCMS [Structured Text (DAST)](https://www.datocms.com/docs/structured-text/dast) fields.

## Contents

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

## Basic Usage

For simple Structured Text fields (no blocks, links, or inline records), query only `value`:

```jsx
import { StructuredText } from 'react-datocms';

function BlogPost({ data }) {
  return (
    <div>
      <h1>{data.blogPost.title}</h1>
      <StructuredText data={data.blogPost.content} />
    </div>
  );
}
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

Use `renderBlock`, `renderInlineRecord`, `renderLinkToRecord`, and `renderInlineBlock` to handle embedded content. Always switch on `record.__typename`:

```jsx
<StructuredText
  data={data.blogPost.content}
  renderBlock={({ record }) => {
    switch (record.__typename) {
      case 'ImageBlockRecord':
        return <Image data={record.image.responsiveImage} />;
      case 'CtaRecord':
        return (
          <a className="button" href={record.url}>
            {record.title}
          </a>
        );
      default:
        return null;
    }
  }}
  renderInlineRecord={({ record }) => {
    switch (record.__typename) {
      case 'TeamMemberRecord':
        return <a href={`/team/${record.slug}`}>{record.firstName}</a>;
      default:
        return null;
    }
  }}
  renderLinkToRecord={({ record, children, transformedMeta }) => {
    switch (record.__typename) {
      case 'TeamMemberRecord':
        return (
          <a {...transformedMeta} href={`/team/${record.slug}`}>
            {children}
          </a>
        );
      default:
        return null;
    }
  }}
  renderInlineBlock={({ record }) => {
    switch (record.__typename) {
      case 'MentionRecord':
        return <code>@{record.username}</code>;
      default:
        return null;
    }
  }}
/>
```

## Custom Node Rules

Override default rendering for any node type using `customNodeRules` with `renderNodeRule`. Import type guards from `datocms-structured-text-utils`.

```jsx
import { renderNodeRule, StructuredText } from 'react-datocms';
import { isHeading, isCode } from 'datocms-structured-text-utils';
import { render as toPlainText } from 'datocms-structured-text-to-plain-text';

<StructuredText
  data={data.blogPost.content}
  customNodeRules={[
    // Add anchors to headings for in-page navigation
    renderNodeRule(isHeading, ({ node, children, key }) => {
      const HeadingTag = `h${node.level}`;
      const anchor = toPlainText(node)
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');

      return (
        <HeadingTag key={key}>
          {children} <a id={anchor} />
          <a href={`#${anchor}`} />
        </HeadingTag>
      );
    }),

    // Custom syntax highlighting for code blocks
    renderNodeRule(isCode, ({ node, key }) => {
      return (
        <SyntaxHighlight
          key={key}
          code={node.code}
          language={node.language}
          linesToBeHighlighted={node.highlight}
        />
      );
    }),
  ]}
/>
```

Available type guards: `isHeading`, `isCode`, `isParagraph`, `isList`, `isListItem`, `isBlockquote`, `isLink`, `isRoot`, and more — see [datocms-structured-text-utils](https://github.com/datocms/structured-text/tree/main/packages/utils#typescript-type-guards).

The `renderNodeRule` callback receives `{ node, children, key, ancestors, adapter }`. Use `ancestors` to apply different rendering based on parent context (e.g., top-level vs nested paragraphs).

**Note:** If you override the rules for `inlineItem`, `itemLink`, `block`, or `inlineBlock` nodes via `customNodeRules`, the corresponding `renderInlineRecord`, `renderLinkToRecord`, `renderBlock`, and `renderInlineBlock` props are ignored.

## Custom Mark Rules

Override how marks (bold, italic, etc.) render using `customMarkRules` with `renderMarkRule`:

```jsx
import { renderMarkRule, StructuredText } from 'react-datocms';

<StructuredText
  data={data.blogPost.content}
  customMarkRules={[
    renderMarkRule('strong', ({ children, key }) => {
      return <b key={key}>{children}</b>;
    }),
  ]}
/>
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

```jsx
import { StructuredText } from 'react-datocms';
import { isEmptyDocument } from 'datocms-structured-text-utils';

function BlogPost({ data }) {
  return (
    <div>
      <h1>{data.blogPost.title}</h1>
      {!isEmptyDocument(data.blogPost.content) && (
        <StructuredText data={data.blogPost.content} />
      )}
    </div>
  );
}
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

Render DAST to an HTML string server-side (non-React contexts, emails, RSS feeds):

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
| `renderBlock` | `({ record }) => ReactElement \| null` | Only if document has `block` nodes | Render embedded block records |
| `renderInlineRecord` | `({ record }) => ReactElement \| null` | Only if document has `inlineItem` nodes | Render inline record references |
| `renderLinkToRecord` | `({ record, children, transformedMeta }) => ReactElement \| null` | Only if document has `itemLink` nodes | Render links to other records |
| `renderInlineBlock` | `({ record }) => ReactElement \| null` | Only if document has `inlineBlock` nodes | Render inline block records |
| `metaTransformer` | `({ node, meta }) => Object \| null` | No | Transform link/itemLink `meta` into HTML props |
| `customNodeRules` | `Array<RenderRule>` | No | Custom node rendering rules (via `renderNodeRule()`) |
| `customMarkRules` | `Array<RenderMarkRule>` | No | Custom mark rendering rules (via `renderMarkRule()`) |
| `renderText` | `(text: string, key: string) => ReactElement \| string \| null` | No | Custom text node rendering |

## Content Link Integration

When using Visual Editing (Content Link), Structured Text fields require special data attributes to make click-to-edit work correctly:

**Rule 1:** Always wrap `<StructuredText>` in a `data-datocms-content-link-group`:

```jsx
<div data-datocms-content-link-group>
  <StructuredText data={page.content} />
</div>
```

**Rule 2:** Add `data-datocms-content-link-boundary` on `renderBlock`, `renderInlineRecord`, and `renderInlineBlock` — but **NOT** on `renderLinkToRecord`:

```jsx
<div data-datocms-content-link-group>
  <StructuredText
    data={page.content}
    renderBlock={({ record }) => (
      <div data-datocms-content-link-boundary>
        <BlockComponent block={record} />
      </div>
    )}
    renderInlineRecord={({ record }) => (
      <span data-datocms-content-link-boundary>
        <InlineComponent record={record} />
      </span>
    )}
    renderLinkToRecord={({ record, children, transformedMeta }) => (
      <a {...transformedMeta} href={`/resources/${record.slug}`}>
        {children}
      </a>
    )}
    renderInlineBlock={({ record }) => (
      <span data-datocms-content-link-boundary>
        <InlineBlockComponent record={record} />
      </span>
    )}
  />
</div>
```

**Why `renderLinkToRecord` doesn't need a boundary:** Record links are `<a>` tags wrapping text that belongs to the surrounding structured text. They don't introduce a separate editing target, so no URL collision occurs.

## Project Wrapper Component

Don't import `<StructuredText />` from `react-datocms` into pages directly — wrap once, use the wrapper everywhere. Conventionally exported as `<Text>` from `src/components/Text/index.tsx` so it's visually distinct from the upstream component at call sites. Reasons:

- Every render needs `data-datocms-content-link-group` for Visual Editing — wrapper enforces it so no page can forget.
- Wrapper is the right place for project-wide `customNodeRules` (headings, code, etc.) so every structured-text field renders consistently without each caller restating them.

Type the wrapper's props by borrowing from upstream `StructuredTextPropTypes`. Stay generic over `BlockRecord` / `LinkRecord` / `InlineBlockRecord`:

```tsx
import {
  StructuredText,
  type StructuredTextPropTypes,
  renderNodeRule,
} from 'react-datocms';
import { type CdaStructuredTextRecord, isCode, isHeading } from 'datocms-structured-text-utils';

export function Text<
  BlockRecord extends CdaStructuredTextRecord = CdaStructuredTextRecord,
  LinkRecord extends CdaStructuredTextRecord = CdaStructuredTextRecord,
  InlineBlockRecord extends CdaStructuredTextRecord = CdaStructuredTextRecord,
>({
  customNodeRules,
  ...props
}: StructuredTextPropTypes<BlockRecord, LinkRecord, InlineBlockRecord>) {
  return (
    <div data-datocms-content-link-group>
      <StructuredText<BlockRecord, LinkRecord, InlineBlockRecord>
        {...props}
        customNodeRules={[
          ...(customNodeRules ?? []),
          renderNodeRule(isCode, ({ node, key }) => <Code key={key} node={node} />),
          renderNodeRule(isHeading, ({ node, key, children }) => (
            <HeadingWithAnchorLink node={node} key={key}>
              {children}
            </HeadingWithAnchorLink>
          )),
        ]}
      />
    </div>
  );
}
```

- **Prepend caller's rules**, not append — `customNodeRules` resolves earlier rules first, so caller-supplied rules must come first to take precedence over project defaults.
- Use `CdaStructuredTextRecord`, not the deprecated `Record` alias from `datocms-structured-text-utils`.
- Heavy / client-only node renderers should use `next/dynamic` (e.g. `const Code = dynamic(() => import('@/components/Code'))`) so they aren't pulled into the page's initial JS bundle.

## Link-to-Record Component Shape

Link-to-record components have a different prop signature than blocks/inline records — `{ record, transformedMeta, children }`:

```tsx
import type { TransformedMeta } from 'datocms-structured-text-generic-html-renderer';
import { PageUrlFragment, buildUrlForPage } from '@/lib/datocms/gqlUrlBuilder/page';

export const PageLinkFragment = graphql(
  /* GraphQL */ `
    fragment PageLinkFragment on PageRecord {
      ...PageUrlFragment
    }
  `,
  [PageUrlFragment],
);

type Props = {
  record: FragmentOf<typeof PageLinkFragment>;
  transformedMeta: TransformedMeta;
  children: ReactNode;
};

export default function PageLink({ record, transformedMeta, children }: Props) {
  const unmaskedRecord = readFragment(PageLinkFragment, record);
  return (
    <Link {...transformedMeta} href={buildUrlForPage(unmaskedRecord)}>
      {children}
    </Link>
  );
}
```

- **No `data-datocms-content-link-boundary`** on link-to-record components — renderer handles those boundaries. Inline-record components _do_ set it themselves.
- **Spread `{...transformedMeta}`** so renderer-provided attributes (`target`, `rel`, …) are honored.
