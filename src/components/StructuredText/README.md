# Structured Text

**Renders the content from a [DatoCMS Structured Text](https://www.datocms.com/docs/structured-text/dast) field, with configurable renderers per Structured Text node type.**

> [!NOTE]
> This component is based on the [`StructuredText` component from `@datocms/svelte`](https://github.com/datocms/datocms-svelte/tree/main/src/lib/components/StructuredText) (there currently is no official DatoCMS Astro package available). The documentation and examples below are also borrowed and adapted from the Svelte version.

## Setup

Import the component like this:

```astro
---
import StructuredText from '@components/StructuredText/StructuredText.astro';
---
```

## Basic usage
```astro
---
import StructuredText from '@components/StructuredText/StructuredText.astro';

const query = `
  query {
    blogPost {
      title
      content {
        value
      }
    }
  }
`;

const response = await fetch('https://graphql.datocms.com/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: "Bearer faeb9172e232a75339242faafb9e56de8c8f13b735f7090964",
  },
  body: JSON.stringify({ query })
})

const { data } = await response.json()
---

<article>
  { data && (
    <h1>{ data.blogPost.title }</h1>
    <StructuredText data={data.blogPost.content} />
  )}
</article>
```

## Customization

The `<StructuredText />` component comes with a set of default components that are use to render all the nodes present in [DatoCMS Dast trees](https://www.datocms.com/docs/structured-text/dast). These default components are enough to cover most of the simple cases.

You need to use custom components in the following cases:

- you have to render blocks, inline items or item links: there's no conventional way of rendering theses nodes, so you must create and pass custom components;
- you need to render a conventional node differently (e.g. you may want a custom render for blockquotes)

### Custom components for blocks

Here is an example using custom components for blocks, inline and item links. Take a look at the [test fixtures (Svelte)](https://github.com/datocms/datocms-svelte/tree/main/src/lib/components/StructuredText/__tests__/__fixtures__) to see examples on how to implement these components.

```astro
---
import { isBlock, isInlineItem, isItemLink } from 'datocms-structured-text-utils';

import StructuredText from '@components/StructuredText/StructuredText.astro';

import Block from './Block.astro';
import InlineItem from './InlineItem.astro';
import ItemLink from './ItemLink.astro';

const query = `
  query {
    blogPost {
      title
      content {
        value
        links {
          __typename
          ... on TeamMemberRecord {
            id
            firstName
            slug
          }
        }
        blocks {
          __typename
          ... on ImageRecord {
            id
            image {
              responsiveImage(
                imgixParams: { fit: crop, w: 300, h: 300, auto: format }
              ) {
                srcSet
                webpSrcSet
                sizes
                src
                width
                height
                aspectRatio
                alt
                title
                base64
              }
            }
          }
        }
      }
    }
  }
`;

const response = await fetch('https://graphql.datocms.com/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: "Bearer faeb9172e232a75339242faafb9e56de8c8f13b735f7090964",
  },
  body: JSON.stringify({ query })
})

const { data } = await response.json()
---

<article>
{ data && (
  <h1>{ data.blogPost.title }</h1>
  <StructuredText
    data={data.blogPost.content}
    components={[
      [isInlineItem, InlineItem],
      [isItemLink, ItemLink],
      [isBlock, Block]
    ]}
  />
)}
</article>
```

### Override default rendering of nodes

`<StructuredText />` automatically renders all nodes (except for `inline_item`, `item_link` and `block`) using a set of default components, that you might want to customize. For example:

- For `heading` nodes, you might want to add an anchor;
- For `code` nodes, you might want to use a custom syntax highlighting component;

In this case, you can easily override default rendering rules with the `components` props. See test fixtures for example implementations of custom components (e.g. [this special heading component (Svelte)](https://github.com/datocms/datocms-svelte/blob/main/src/lib/components/StructuredText/__tests__/__fixtures__/IncreasedLevelHeading.svelte)).

```astro
---
import { isHeading, isCode } from 'datocms-structured-text-utils';
import StructuredText from '@components/StructuredText/StructuredText.astro';

import Heading from './Heading.astro';
import Code from './Code.astro';

const { data } = Astro.props;
---

<StructuredText
	data={data.blogPost.content}
	components={[
		[isHeading, Heading],
		[isCode, Code]
	]}
/>
```

## Props

| prop | type | required | description | default |
| --- | --- | --- | --- | --- |
| data | `StructuredText \| DastNode` | :white_check_mark: | The actual [field value](https://www.datocms.com/docs/structured-text/dast) you get from DatoCMS | |
| components | [`PredicateComponentTuple[] \| null`](./StructuredText.d.ts) | Only required if data contain `block`, `inline_item` or `item_link` nodes | Array of tuples formed by a predicate function and custom component | `[]` |
