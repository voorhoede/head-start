# CMS Data Loading

**Head Starts provides loaders and helpers to fetch content from DatoCMS.**

## Configuration

Head Start supports the use of [primary and sandbox environments in DatoCMS](https://www.datocms.com/docs/scripting-migrations/introduction). This enables feature branches to use a different environment than the main branch. You need to set the DatoCMS environment where content should be fetched from in [`/datocms-environment.ts`](/datocms-environment.ts):

```ts
export const datocmsEnvironment = 'your-environment-name';
```

## GraphQL files

Head Start uses the [DatoCMS Content Delivery API](https://www.datocms.com/docs/content-delivery-api), which uses [GraphQL](https://graphql.org/). Head Start has a pre-configured GraphQL loader, so you can use and directly import `.graphql` files. As a convention Head Start puts [GraphQL Query](https://graphql.org/learn/queries/) files (like `_page-name.query.graphql`) directly next to their related Astro pages, and [GraphQL Fragment](https://graphql.org/learn/queries/) files (like `block-name.fragment.graphql`) directly next to their related block components:

```
src/
├── blocks/
│   ├── Blocks.astro
│   └── SomeContentBlock/
│       ├── SomeContentBlock.astro
│       └── SomeContentBlock.fragment.graphql
|
└── pages/
    └── [locale]/
        ├── index.astro
        └── _index.query.graphql
```

You can import GraphQL Fragment files:

```graphql
# src/blocks/ImageBlock/ImageBlock.fragment.graphql

fragment ImageBlock on ImageBlockRecord {
  id
  image {
    alt
    title
    url
    # ...
  }
}
```

```graphql
# src/pages/[locale]/[slug]/_index.query.graphql

#import '@blocks/ImageBlock/ImageBlock.fragment.graphql'
#import '@blocks/TextBlock/TextBlock.fragment.graphql'

query Page($locale: SiteLocale!, $slug: String!) {
  page(locale: $locale, filter: { slug: { eq: $slug } }) {
    title
    # ...
    bodyBlocks {
      __typename
      ... on ImageBlockRecord {
        ...ImageBlock
      }
      ... on TextBlockRecord {
        ...TextBlock
      }
    }
  }
}
```

And you can import GraphQL Query files:

```ts
// src/pages/[locale]/[slug]/index.astro

import query from './_index.query.graphql';
console.log(typeof query) // DocumentNode
```

Head Start automatically generates TypeScript types for all your GraphQL files, which you can import:

```ts
import type { ImageBlockFragment, PageQuery, PageRecord } from '@lib/types/datocms';
```

## DatoCMS requests

Head Start provides a generic `datocmsRequest()` helper to fetch data using the [DatoCMS Content Delivery API](https://www.datocms.com/docs/content-delivery-api). This function automatically uses the DatoCMS environment you've [configured](#configuration). It expects a `query` like the one that can be imported from a [`.graphql` file](#graphql-files), and supports passing `variables` to that query.

Example usage:

```astro
---
import { datocmsRequest } from '@lib/datocms';
import type { PageQuery, PageRecord } from '@lib/types/datocms';
import query from './_index.query.graphql';

const { page } = await datocmsRequest<PageQuery>({ 
  query,
  variables: { locale, slug: Astro.params.slug } 
}) as { page: PageRecord };
---
```

If you want to use `datocmRequest()` without importing a [`.graphql` file](#graphql-files), you can use the `parse` helper to change a string into a DocumentNode expected by the function:

```ts
import parse from 'graphql';

const query = parse(/* graphql */`
  query Example {
    _site {
      globalSeo {
        siteName
      }
    }
  }
`);

const data = await datocmsRequest({ query });
```

## DatoCMS collections

Head Start provides a `datocmsCollection()` helper to retrieve all records of a collection. DatoCMS limits requests to 100 records. This function uses `datocmsRequest()` combined with pagination, to get all records even if there are more than 100. This is especialy useful when defining [`getStaticPaths()` in an Astro template](https://docs.astro.build/en/core-concepts/routing/#static-ssg-mode). The `datocmsCollection()` allows you to provide a fragment, so you can define what data you want for each record.

Simplified example without types:

```ts
import { datocmsCollection } from '@lib/datocms';

const pages = await datocmsCollection({ 
  collection: 'Pages',
  fragment: `slugs: _allSlugLocales { locale, value }`,
});
```

More realistic example with types:

```astro
---
import { datocmsCollection } from '@lib/datocms';

export async function getStaticPaths() {
  interface PagesCollectionItem {
    slugs: Array<{ locale: string; value: string; }>;
  }
  const pages = await datocmsCollection<PagesCollectionItem>({ 
    collection: 'Pages',
    fragment: `slugs: _allSlugLocales { locale, value }`,
  });
  return pages.flatMap(page => page.slugs.map((slug) => ({
    params: { locale: slug.locale, slug: slug.value }
  })));
}
---
```

## DatoCMS search

See [`datocmsSearch()` in the Search documentation](./search.md#search-lib-function).
