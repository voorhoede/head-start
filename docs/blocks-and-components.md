# Blocks and Components

**Head Start distinguishes between CMS content related Blocks and regular UI Components.**

## Block and component files

Head Start is based on the Astro project structure (see [Project Structure](./project-structure.md)). Head Start extends the default structure to group blocks next to the regular components:

```
src/
├── blocks/
│   ├── Blocks.astro
│   ├── Blocks.d.ts
│   └── SomeContentBlock/
│       ├── SomeContentBlock.astro
│       ├── SomeContentBlock.fragment.graphql
│       ├── SomeContentBlock.client.ts
│       └── SomeContentBlock.test.ts
│
└── components/
    └── SomeUiComponent/
        ├── SomeUiComponent.astro
│       ├── SomeContentBlock.client.ts
│       └── SomeContentBlock.test.ts
```

- [Components](https://docs.astro.build/en/core-concepts/astro-components/) are the UI elements the website is composed of. This can be Astro and framework specific components.
- Blocks are a specific set of components which have a complementary content [Block](https://www.datocms.com/docs/content-modelling/blocks) in DatoCMS and therefore have a paired GraphQL Fragment file.
- Optionally blocks and components have a complementary `*.client.ts` file for client-side scripts and a `*.test.ts` file for related unit tests.

> [!NOTE]
> You can use `npm run create:block` and `npm run create:component` to quickly scaffold a new block or component with their associated files.

See [CMS Data Loading](./cms-data-loading.md) for documentation on the use of GraphQL Fragment files.

## Creating a new Block

Before setting the front end code in HeadStart for your new block, first create the Block in your DatoCMS project. [Check here for more information](https://www.datocms.com/docs/content-modelling/blocks)

1. Go to Schema > Blocks (`environments/ENVIRONMENT_NAME/schema/blocks_library`)
2. Create a new block

- The `Model ID` of the block should be the snakecase version of your Block name in the frontend.

For example, if you want to create a `TestBlock`, you need to set your DatoCMS Block to the following:

```bash
Name: Test Block
'Model ID': test_block
```

## Block templates

Head Start uses the same convention for props and types for every Block: the `Props` interface always contains a `block` property containing the type based on the CMS model. This `block` type is automatically generated based on a Block's GraphQL Fragment file (see [CMS Data Loading](./cms-data-loading.md#graphql-files)). This means a basic Block template looks like this:

```astro
---
import type { SomeContentBlockFragment } from '@lib/datocms/types';

interface Props {
  block: SomeContentBlockFragment
}

const { block } = Astro.props;
---

{ block.someContentBlockField }
```

## Modular Blocks

Within the CMS the Blocks are used in [Modular Content](https://www.datocms.com/docs/content-modelling/modular-content) and [Structured Text](https://www.datocms.com/docs/content-modelling/structured-text) to create dynamic layouts.

Pages and other templates can use the `<Blocks />` component to render a Modular Content or Structured Text field. For example:

```astro
---
import { datocmsRequest } from '@lib/datocms';
import Blocks from '@blocks/Blocks.astro';
import query from './_index.query.graphql';

const { page } = await datocmsRequest({ query, variables: { locale: Astro.params.locale } });
---

<Blocks blocks={page.bodyBlocks} />
```

When you create a new Block, you need to register it in [`blocks/Blocks.astro`](../src/blocks/Blocks.astro) (using the CMS model's typename) and add its type to [`blocks/Blocks.d.ts`](../src/blocks/Blocks.d.ts):

Register a new Block's template:

```astro
---
// src/Blocks/Blocks.astro:

import type { AnyBlock } from './Blocks';
import ImageBlock from './ImageBlock/ImageBlock.astro';
// import your new Block template (order imports A to Z):
import SomeContentBlock from './SomeContentBlock/SomeContentBlock.astro';
import TextBlock from './TextBlock/TextBlock.astro';

const blocksByTypename = {
  ImageBlockRecord: ImageBlock,
  // register your new Block using its CMS model's typename (order A to Z):
  SomeContentBlockRecord: SomeContentBlock,
  TextBlockRecord: TextBlock,
};

interface Props {
  blocks: AnyBlock[];
}
const { blocks } = Astro.props;
```

Register a new Block's type:

```ts
// src/Blocks/Blocks.d.ts:

import {
  ImageBlockFragment,
  // import new Block's Fragment:
  SomeContentBlockFragment,
  TextBlockFragment,
} from '@lib/datocms/types';

export type AnyBlock =
  | ImageBlockFragment
  | SomeContentBlockFragment // and add it here (order A to Z)
  | TextBlockFragment;
```

## Using Blocks in Pages

You probably want to use your block on certain pages. Depending on the block you might want to add it to a number of models such as Page, Home, 404, et cetera.

1.  In your DatoCMS project, go to Schema > Models `/environments/ENVIRONMENT_NAME/schema/item_types`.
2.  Click on the page model of your choice.
2.  Edit the `Body` field. Validations > Specifiy the allowed blocks for this field. Add your new block.
3.  Update your frontend code `page` graphql query. The path of this file will depend on your model of choice.
- import your new Block fragment
- add your new block record in `bodyBlocks`

```graphql
#src/pages/[locale]/[...path]/_index.query.graphql

#  Update the above file for the Page model
#  Be sure to import your new block fragment

#import '@blocks/TestBlock/TestBlock.fragment.graphql'

page(locale: $locale, filter: { slug: { eq: $slug } }) {
  # redacted content
   bodyBlocks {
     __typename
     ... on ActionBlockRecord {
       ...ActionBlock
     }
     # add your new block
     ... on TestBlockRecord {
       ...TestBlock
     }
   }
```
4. Test your new block by adding content. In your DatoCMS project, go to Content > Pages.
- Create a new record and confirm that you can add your new block to the `Body`.
- If you run your frontend code with `npm run dev`, you will be able to access your newly created page.

## Client-side scripts

Astro supports [client-side scripts inside components](https://docs.astro.build/en/guides/client-side-scripts/#client-side-scripts). Head Start uses the convention to include these as external scripts for better TypeScript intellisense and linting. To distinguish server-side files (most in Astro) from client-side scripts we use a `.client.ts` extension. So blocks and components can include these as `<script src="./SomeComponent.client.ts"></script>`.

## Testing components

[Head Start provides a testing setup](./testing.md). This includes helpers to make component testing easier. Astro renders components to string. The `renderToFragment` helper allows you to test components as document fragments providing most familiar DOM methods like `.querySelector` and `.getAttribute`:

```ts
// SomeComponent.test.ts
import { describe, expect, test } from 'vitest';
import { renderToFragment } from '@lib/renderer';
import SomeComponent, { type Props } from './SomeComponent.astro';

describe('Some Component', () => {
  const fragment = await renderToFragment<Props>(SomeComponent, {
    someProp: 'some value',
  });

  test('uses some prop as attribute', () => {
    const value = fragment
      .querySelector('.someSelector')
      ?.getAttribute('some-attribute');
    expect(value).toBe('some value');
  });

  // Add more tests here
});
```

Note: test files must use the `.test.ts` extension to run.
