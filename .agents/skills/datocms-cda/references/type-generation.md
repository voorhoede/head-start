# Type Generation Setup

This reference covers setting up TypeScript type generation for fully typed DatoCMS CDA queries using **gql.tada** or **GraphQL Code Generator**. Both produce `TypedDocumentNode` that `executeQuery` accepts directly (see `client-and-config.md` for TypedDocumentNode support).

## Contents

- Which Approach?
- gql.tada
- GraphQL Code Generator
- CMA Schema Types

## Which Approach?

| | gql.tada | GraphQL Code Generator |
| - | - | - |
| **Best for** | New projects, simpler setups | Existing codegen pipelines, `.graphql` file workflows |
| **Query style** | `graphql()` tagged template in `.ts` files | Queries in `.graphql` files or inline with codegen |
| **Fragment style** | Fragment masking via `readFragment()` + `FragmentOf<>` | Fragment masking via `getFragmentData()` + `FragmentType<>` |
| **Type generation** | Automatic via TS plugin (IDE) + schema file | Manual `graphql-codegen` CLI command |
| **Used in** | All DatoCMS starters | DatoCMS fully-fledged demos |

Both approaches produce `TypedDocumentNode` — the `executeQuery` function from `@datocms/cda-client` accepts either and returns fully typed results.

## gql.tada

### Install

```bash
npm install gql.tada
npm install --save-dev dotenv-cli
```

### Generate Schema

Add to `package.json` scripts:

```json
"generate-schema": "dotenv -c -- bash -c 'gql.tada generate schema https://graphql.datocms.com --header \"X-Exclude-Invalid: true\" --header \"Authorization: $DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN\"'"
```

Run `npm run generate-schema` to produce `schema.graphql` at the project root. Re-run after model changes.

> **Token env var:** The command above uses `DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN` (the setup recipe convention). If your project uses a different name like `DATOCMS_CDA_TOKEN`, adjust the command accordingly.

> **Framework env var conventions:** SvelteKit prefixes with `PRIVATE_` (e.g., `PRIVATE_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN`). Nuxt prefixes with `NUXT_PUBLIC_` (e.g., `NUXT_PUBLIC_DATOCMS_PUBLISHED_CONTENT_CDA_TOKEN`).

### tsconfig.json Plugin

Add to `compilerOptions.plugins`:

```json
{
  "name": "gql.tada/ts-plugin",
  "schema": "./schema.graphql",
  "tadaOutputLocation": "./src/lib/datocms/graphql-env.d.ts"
}
```

**Framework differences:**

| Framework | Plugin name | Output path |
| - | - | - |
| Next.js | `gql.tada/ts-plugin` | `./src/lib/datocms/graphql-env.d.ts` |
| Astro | `gql.tada/ts-plugin` | `./src/lib/datocms/graphql-env.d.ts` |
| SvelteKit | `@0no-co/graphqlsp` | `./src/lib/datocms/graphql-env.d.ts` |
| Nuxt | `gql.tada/ts-plugin` | `./lib/datocms/graphql-env.d.ts` |

SvelteKit uses `@0no-co/graphqlsp` (the underlying LSP plugin) instead of `gql.tada/ts-plugin`. Nuxt omits the `src/` prefix.

### Initialization File

Create the `graphql.ts` file at the output path's directory (e.g., `src/lib/datocms/graphql.ts`):

```ts
import { initGraphQLTada } from 'gql.tada';
import type { introspection } from './graphql-env.js';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    BooleanType: boolean;
    CustomData: Record<string, string>;
    Date: string;
    DateTime: string;
    FloatType: number;
    IntType: number;
    ItemId: string;
    JsonField: unknown;
    MetaTagAttributes: Record<string, string>;
    UploadId: string;
  };
}>();

export { readFragment } from 'gql.tada';

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
```

The `scalars` object maps DatoCMS custom GraphQL scalars to TypeScript types. See `client-and-config.md` for the full scalar reference.

### CI / Build Output

The tsconfig plugin generates types in the IDE, but CI builds need an explicit output step. Add to `package.json` scripts:

```json
"generate-output": "gql.tada generate output"
```

Run `npm run generate-schema && npm run generate-output` in CI before `tsc` or the framework build.

### Key Exports

| Export | Purpose |
| - | - |
| `graphql` | Tagged template function — wraps queries and fragments for type inference |
| `readFragment` | Unmasks a fragment result to access its typed data |
| `FragmentOf<typeof fragment>` | Type of a masked fragment reference (used in component props) |
| `ResultOf<typeof query>` | Inferred result type of a query or fragment |
| `VariablesOf<typeof query>` | Inferred variables type of a query |

## GraphQL Code Generator

### Install

```bash
npm install @graphql-typed-document-node/core graphql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/client-preset graphql-config
```

> The `client` preset bundles `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations`, and `@graphql-codegen/typed-document-node` — no need to install them separately.

### Configuration

Create `graphql.config.ts` at the project root:

```ts
import 'dotenv/config';
import type { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
  schema: [
    {
      'https://graphql.datocms.com': {
        headers: {
          Authorization: `Bearer ${process.env.DATOCMS_READONLY_API_TOKEN}`,
          'X-Exclude-Invalid': 'true',
        },
      },
    },
  ],
  documents: ['./app/**/*.graphql', './components/**/*.graphql'],
  extensions: {
    codegen: {
      generates: {
        'graphql/types/': {
          preset: 'client',
          presetConfig: {
            fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
          },
          config: {
            strictScalars: true,
            scalars: {
              BooleanType: 'boolean',
              CustomData: 'Record<string, string>',
              Date: 'string',
              DateTime: 'string',
              FloatType: 'number',
              IntType: 'number',
              ItemId: 'string',
              JsonField: 'unknown',
              MetaTagAttributes: 'Record<string, string>',
              UploadId: 'string',
            },
          },
        },
      },
    },
  },
};

export default config;
```

Adjust the `documents` glob to match where your `.graphql` files live.

### Generate Script

Add to `package.json` scripts:

```json
"generate-ts-types": "graphql-codegen --config graphql.config.ts"
```

### Generated Output

| File | Contents |
| - | - |
| `graphql/types/graphql.ts` | All TypeScript types for your schema |
| `graphql/types/gql.ts` | `graphql()` function for typed document nodes |
| `graphql/types/fragment-masking.ts` | `getFragmentData()` and `FragmentType` helpers |
| `graphql/types/index.ts` | Re-exports from all generated files |

### Key Imports

| Import | Source | Purpose |
| - | - | - |
| `graphql` | `graphql/types/gql` | Wraps `.graphql` content into `TypedDocumentNode` |
| `getFragmentData` | `graphql/types/fragment-masking` | Unmasks a fragment result to access typed data |
| `FragmentType<typeof fragment>` | `graphql/types/fragment-masking` | Type of a masked fragment reference (used in component props) |

### `.graphql` File Pattern

With graphql-codegen, queries and fragments are typically colocated in `.graphql` files next to their components:

```
components/
  BlogPost/
    BlogPost.tsx
    BlogPost.graphql    ← fragment definition
app/
  blog/
    page.graphql        ← page query
    page.tsx
```

The `documents` glob in `graphql.config.ts` controls which files are scanned.

## CMA Schema Types

For generating TypeScript types for CMA record operations (`datocms schema:generate`), see the CMA skill's `references/type-generation.md`. If the CMA skill is not installed, ask the user to install it.
