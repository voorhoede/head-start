# Structured Text

Covers querying structured text fields: the three sub-fields (`value`, `blocks`, `links`), DAST node types, inline blocks, and rendering.

## Contents

- Response Shape
- The `value` Field — DAST Structure
- The `blocks` Field
- The `links` Field
- The `inlineBlocks` Field
- Rendering
- Complete Example

## Response Shape

Structured text fields return an object with up to four sub-fields:

| Sub-field | Description |
| - | - |
| `value` | The DAST (DatoCMS Abstract Syntax Tree) JSON document — contains the text structure |
| `blocks` | Array of embedded block records (referenced by `block` nodes in DAST) |
| `links` | Array of linked records (referenced by `itemLink` and `inlineItem` nodes in DAST) |
| `inlineBlocks` | Array of inline block records (referenced by `inlineBlock` nodes in DAST) |

**Critical:** Always query all sub-fields that the structured text field uses. If you query only `value` but the content contains embedded blocks or links, those references will be unresolvable and content will be silently missing during rendering.

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    content {
      value
      blocks {
        ... on RecordInterface { id _modelApiKey }
        ... on ImageBlockRecord {
          image {
            responsiveImage(imgixParams: { w: 800 }) {
              src
              srcSet
              width
              height
              alt
            }
          }
        }
        ... on CtaBlockRecord {
          label
          url
        }
      }
      links {
        ... on RecordInterface { id _modelApiKey }
        ... on BlogPostRecord {
          slug
          title
        }
        ... on AuthorRecord {
          name
          slug
        }
      }
    }
  }
}
```

## The `value` Field — DAST Structure

The `value` field contains a JSON object following the DAST (DatoCMS Abstract Syntax Tree) specification:

```json
{
  "schema": "dast",
  "document": {
    "type": "root",
    "children": [
      {
        "type": "paragraph",
        "children": [
          {
            "type": "span",
            "value": "Hello, world!"
          }
        ]
      }
    ]
  }
}
```

### DAST Node Types

| Node Type | Children | Description |
| - | - | - |
| `root` | paragraph, heading, list, code, blockquote, block, thematicBreak | Document root — every DAST document starts with this |
| `paragraph` | span, link, itemLink, inlineItem, inlineBlock | Text paragraph |
| `span` | — (leaf) | Text content. Has `value` (string) and optional `marks` array |
| `heading` | span, link, itemLink, inlineItem, inlineBlock | Heading with `level` attribute (1-6) |
| `link` | span | External hyperlink with `url` attribute. Optional `meta` array of `{ id, value }` pairs for extra attributes (e.g., `target: "_blank"`) |
| `itemLink` | span | Link to a DatoCMS record with `item` attribute (record ID). Optional `meta` array of `{ id, value }` pairs |
| `inlineItem` | — | Inline record reference with `item` attribute (record ID) |
| `inlineBlock` | — | Inline block record with `item` attribute (block record ID) |
| `list` | listItem | Ordered or unordered list with `style` attribute (`"bulleted"` or `"numbered"`) |
| `listItem` | paragraph, list | List item (can contain nested lists) |
| `blockquote` | paragraph | Block quote with optional `attribution` attribute |
| `code` | — | Code block with `code` (string), `language` (string), and optional `highlight` (line numbers array) |
| `block` | — | Embedded block record with `item` attribute (block record ID). **Can only be a direct child of root.** |
| `thematicBreak` | — | Horizontal rule / section divider |

### Span Marks

The `span` node's `marks` array can contain:

| Mark | Description |
| - | - |
| `"strong"` | Bold text |
| `"emphasis"` | Italic text |
| `"underline"` | Underlined text |
| `"strikethrough"` | Struck-through text |
| `"highlight"` | Highlighted text |
| `"code"` | Inline code |

```json
{
  "type": "span",
  "value": "bold and italic",
  "marks": ["strong", "emphasis"]
}
```

Spans support `\n` for line breaks within the same paragraph.

## The `blocks` Field

Query embedded block records using inline fragments. Each block node in the DAST references a block by its `item` ID, which corresponds to a record in the `blocks` array.

```graphql
blocks {
  __typename
  ... on RecordInterface { id }
  ... on ImageBlockRecord {
    image {
      responsiveImage(imgixParams: { w: 800 }) {
        src
        width
        height
        alt
      }
    }
    caption
  }
  ... on VideoBlockRecord {
    video {
      video {
        streamingUrl
        thumbnailUrl(format: jpg)
      }
    }
  }
}
```

## The `links` Field

Query linked records (referenced by `itemLink` and `inlineItem` nodes in the DAST). These are full DatoCMS records from any model.

```graphql
links {
  __typename
  ... on RecordInterface { id }
  ... on BlogPostRecord {
    slug
    title
  }
  ... on AuthorRecord {
    name
    slug
    avatar { url }
  }
}
```

## The `inlineBlocks` Field

Query inline block records (referenced by `inlineBlock` nodes in the DAST). These appear inline within text, unlike regular blocks which are full-width.

```graphql
inlineBlocks {
  __typename
  ... on RecordInterface { id }
  ... on MentionBlockRecord {
    username
    displayName
  }
}
```

## Rendering

DatoCMS provides `<StructuredText>` components for popular frameworks that handle DAST rendering automatically:

| Framework | Package | Component |
| - | - | - |
| React | `react-datocms` | `<StructuredText>` |
| Vue | `vue-datocms` | `<StructuredText>` |
| Svelte | `@datocms/svelte` | `<StructuredText>` |
| Astro | `@datocms/astro` | `<StructuredText>` |

For non-framework contexts (search indexing, emails, APIs), use these utility packages:

| Package | Output |
| - | - |
| `datocms-structured-text-to-plain-text` | Plain text string |
| `datocms-structured-text-to-html-string` | HTML string |
| `datocms-structured-text-to-dom-nodes` | DOM nodes |

The framework components accept custom renderers for blocks, inline records, inline blocks, and record links:

```tsx
import { StructuredText } from "react-datocms";

<StructuredText
  data={post.content}
  renderBlock={({ record }) => {
    switch (record._modelApiKey) {
      case "image_block":
        return <img src={record.image.url} alt={record.image.alt} />;
      case "cta_block":
        return <a href={record.url}>{record.label}</a>;
      default:
        return null;
    }
  }}
  renderInlineRecord={({ record }) => {
    return <a href={`/posts/${record.slug}`}>{record.title}</a>;
  }}
  renderLinkToRecord={({ record, children }) => {
    return <a href={`/posts/${record.slug}`}>{children}</a>;
  }}
  renderInlineBlock={({ record }) => {
    switch (record._modelApiKey) {
      case "mention_block":
        return <span className="mention">@{record.username}</span>;
      default:
        return null;
    }
  }}
/>
```

## Complete Example

```ts
import { executeQuery } from "@datocms/cda-client";

const query = `
  query ArticleBySlug($slug: String!) {
    article(filter: { slug: { eq: $slug } }) {
      title
      body {
        value
        blocks {
          ... on RecordInterface {
            id
            _modelApiKey
          }
          ... on ImageBlockRecord {
            image {
              responsiveImage(imgixParams: { w: 800, auto: format }) {
                src
                srcSet
                sizes
                width
                height
                alt
                base64
              }
            }
            caption
          }
          ... on CodeBlockRecord {
            language
            code
          }
        }
        links {
          ... on RecordInterface {
            id
            _modelApiKey
          }
          ... on BlogPostRecord {
            slug
            title
          }
          ... on AuthorRecord {
            name
            slug
          }
        }
      }
    }
  }
`;

const data = await executeQuery(query, {
  token: process.env.DATOCMS_CDA_TOKEN!,
  variables: { slug: "my-article" },
});

// data.article.body.value — DAST JSON tree
// data.article.body.blocks — embedded block records
// data.article.body.links — linked records
```
