# CMA Type Generation Setup

This reference covers generating TypeScript types from your DatoCMS schema for type-safe CMA record operations using `datocms`.

The generated types are useful for **both** CMA API styles:

- the **simplified API** via `ItemTypeDefinition` generics on methods such as `client.items.create/update/upsert/...`
- the **raw API** via `raw*()` methods and `RawApiTypes.Item<>` when you intentionally need raw JSON:API payloads or metadata

Default to the simplified API. Reach for raw methods only when the task explicitly needs them. See `client-types-and-behaviors.md` for the `RawApiTypes` overview and dual-API guidance.

## Contents

- Install
- Generate Script
- Generated Output
- Usage

## Install

```bash
npm install --save-dev datocms dotenv-cli
```

`datocms` provides the `datocms schema:generate` command. `dotenv-cli` loads your `.env` file so the API token is available to the script.

## Generate Script

Add to `package.json` scripts:

```json
"generate-cma-types": "dotenv -c -- bash -c 'npx datocms schema:generate src/lib/datocms/cma-types.ts --api-token=$DATOCMS_CMA_TOKEN'"
```

Then run `npm run generate-cma-types` to produce the types file. Re-run after model/field changes.

> **Requires a CMA-capable API token** — the token must have `can_access_cma: true`. A read-only CDA token will not work.

**Framework env var conventions:**

| Framework | Env var name | Output path | Notes |
| - | - | - | - |
| Next.js | `DATOCMS_CMA_TOKEN` | `src/lib/datocms/cma-types.ts` | — |
| Astro | `DATOCMS_CMA_TOKEN` | `src/lib/datocms/cma-types.ts` | — |
| SvelteKit | `PRIVATE_DATOCMS_CMA_TOKEN` | `src/lib/datocms/cma-types.ts` | `PRIVATE_` prefix for server-side env |
| Nuxt | `NUXT_DATOCMS_CMA_TOKEN` | `lib/datocms/cma-types.ts` | No `src/` prefix; remaps to `DATOCMS_API_TOKEN` inline |

The Nuxt script remaps its env var inline because `datocms` expects `DATOCMS_API_TOKEN` by default when `--api-token` is not passed:

```json
"generate-cma-types": "dotenv -c -- bash -c 'DATOCMS_API_TOKEN=$NUXT_DATOCMS_CMA_TOKEN npx datocms schema:generate lib/datocms/cma-types.ts'"
```

## Generated Output

The generated `cma-types.ts` file contains:

1. **`EnvironmentSettings`** — describes the project's locales (e.g., `{ locales: 'en' }` or `{ locales: 'en' | 'it' }`)

2. **One exported type per model/block** — each uses `ItemTypeDefinition<EnvironmentSettings, ModelId, FieldsMap>`:

```ts
import type { ItemTypeDefinition } from '@datocms/cma-client';

type EnvironmentSettings = {
  locales: 'en';
};

export type Page = ItemTypeDefinition<
  EnvironmentSettings,
  'JdG722SGTSG_jEB1Jx-0XA',
  {
    title: { type: 'string' };
    slug: { type: 'slug' };
    structured_text: {
      type: 'structured_text';
      blocks: ImageBlock | VideoBlock;
    };
  }
>;

export type ImageBlock = ItemTypeDefinition<
  EnvironmentSettings,
  'dZOhbVOTSpeaaA-wQMgPCA',
  { asset: { type: 'file' } }
>;
```

3. **Convenience union types** at the bottom:

```ts
export type AnyBlock = ImageGalleryBlock | ImageBlock | VideoBlock;
export type AnyModel = Page;
export type AnyBlockOrModel = AnyBlock | AnyModel;
```

- `AnyBlock` — union of all block models
- `AnyModel` — union of all regular models
- `AnyBlockOrModel` — union of both

## Usage

### Simplified API (default)

Use the generated model/block types directly on simplified item methods:

```ts
import type { Client } from '@datocms/cma-client';
import type { Page } from './cma-types';

export async function createPage(client: Client) {
  return client.items.create<Page>({
    item_type: { type: 'item_type', id: 'PAGE_MODEL_ID' },
    title: 'Hello world',
    slug: 'hello-world',
  });
}
```

### Raw API (only when you need it)

Pass the generated types as generics to `raw*()` methods and `RawApiTypes.Item<>`:

```ts
import type { RawApiTypes } from '@datocms/cma-client';
import type { AnyModel } from './cma-types';

// Typed record access — TypeScript knows which fields exist
function getTitle(item: RawApiTypes.Item<AnyModel>) {
  return item.attributes.title;
}
```

See `client-types-and-behaviors.md` for the `RawApiTypes` namespace overview and the `ItemTypeDefinition` generic system.
