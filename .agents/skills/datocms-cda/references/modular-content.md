# Modular Content

Covers querying modular content fields: GraphQL union types, inline fragments, RecordInterface, single vs multiple block variants, and nested blocks.

## Contents

- How Modular Content Works in GraphQL
- Fragment Querying
- RecordInterface
- Single vs Multiple Blocks
- Nested Blocks
- Complete Example

## How Modular Content Works in GraphQL

Modular content fields are represented as GraphQL **union types**. Each block model becomes a `<BlockModelApiKey>Record` type. You query specific block types using **inline fragments**.

## Fragment Querying

Use `... on <BlockModelApiKey>Record` fragments to select fields from each block type:

```graphql
query {
  blogPost(filter: { slug: { eq: "hello-world" } }) {
    title
    content {
      ... on TextBlockRecord {
        id
        _modelApiKey
        text
      }
      ... on ImageBlockRecord {
        id
        _modelApiKey
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
      ... on QuoteBlockRecord {
        id
        _modelApiKey
        quote
        author
      }
    }
  }
}
```

**Important:** You must include a fragment for every block type you want to render. Blocks without a matching fragment are returned as empty objects (only the `__typename` field is available).

## RecordInterface

All records (including block records) implement the `RecordInterface` GraphQL interface. This provides shared fields you can query without repeating them in every fragment:

```graphql
content {
  ... on RecordInterface {
    id
    _modelApiKey
  }
  ... on TextBlockRecord {
    text
  }
  ... on ImageBlockRecord {
    image { url }
  }
  ... on QuoteBlockRecord {
    quote
    author
  }
}
```

This is a DRY pattern — `id` and `_modelApiKey` are queried once via `RecordInterface` instead of in every fragment.

`_modelApiKey` is especially useful for frontend rendering: you can use it to map blocks to components (e.g., `_modelApiKey === "text_block"` → render `<TextBlock />`).

## Single vs Multiple Blocks

### Multiple Blocks (default)

The most common variant. Returns an **array** of blocks:

```graphql
content {
  ... on TextBlockRecord { text }
  ... on ImageBlockRecord { image { url } }
}
```

Result:

```json
{
  "content": [
    { "_modelApiKey": "text_block", "text": "Hello" },
    { "_modelApiKey": "image_block", "image": { "url": "..." } }
  ]
}
```

### Single Block

When the modular content field is configured to accept only a single block, it returns **one block or `null`**:

```graphql
hero {
  ... on HeroBannerRecord {
    title
    subtitle
    backgroundImage { url }
  }
}
```

Result:

```json
{
  "hero": {
    "_modelApiKey": "hero_banner",
    "title": "Welcome",
    "subtitle": "Hello world",
    "backgroundImage": { "url": "..." }
  }
}
```

Or `null` if no block is set:

```json
{
  "hero": null
}
```

## Nested Blocks

Blocks can contain their own modular content fields, creating nested structures. Query them with the same fragment pattern applied recursively:

```graphql
query {
  page(filter: { slug: { eq: "about" } }) {
    sections {
      ... on RecordInterface {
        id
        _modelApiKey
      }
      ... on TwoColumnSectionRecord {
        leftColumn {
          ... on TextBlockRecord { text }
          ... on ImageBlockRecord { image { url } }
        }
        rightColumn {
          ... on TextBlockRecord { text }
          ... on ImageBlockRecord { image { url } }
        }
      }
      ... on AccordionSectionRecord {
        items {
          ... on AccordionItemRecord {
            title
            content {
              ... on TextBlockRecord { text }
            }
          }
        }
      }
    }
  }
}
```

## Complete Example

```ts
import { executeQuery } from "@datocms/cda-client";

const query = `
  query PageBySlug($slug: String!) {
    page(filter: { slug: { eq: $slug } }) {
      title
      slug
      sections {
        ... on RecordInterface {
          id
          _modelApiKey
        }
        ... on HeroSectionRecord {
          heading
          subheading
          backgroundImage {
            responsiveImage(imgixParams: { w: 1200, h: 600, fit: crop }) {
              src
              srcSet
              width
              height
              alt
              base64
            }
          }
        }
        ... on TextSectionRecord {
          body
        }
        ... on GallerySectionRecord {
          images {
            responsiveImage(imgixParams: { w: 400, h: 400, fit: crop }) {
              src
              srcSet
              width
              height
              alt
              base64
            }
          }
        }
      }
    }
  }
`;

const data = await executeQuery(query, {
  token: process.env.DATOCMS_CDA_TOKEN!,
  variables: { slug: "about" },
});

if (!data.page) throw new Error("Page not found");

for (const section of data.page.sections) {
  switch (section._modelApiKey) {
    case "hero_section":
      console.log("Hero:", section.heading);
      break;
    case "text_section":
      console.log("Text:", section.body);
      break;
    case "gallery_section":
      console.log("Gallery:", section.images.length, "images");
      break;
  }
}
```
