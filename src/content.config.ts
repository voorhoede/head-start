import { collectionMap } from '@lib/collections';

// See `@lib/collections` for actual collection definitions
export const collections = Object.entries(collectionMap).reduce<
  Record<string, typeof collectionMap[keyof typeof collectionMap]['collection']>
>((acc, [key, { collection }]) => {
  acc[key] = collection;
  return acc;
}, {});
