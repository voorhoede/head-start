// Astro expects a content/config.ts file, therefore we export the collections here.
import HomePageCollection from './Home';
import PageCollection from './Pages';
import PagePartialCollection from './PagePartials';

export const collectionMap = {
  // Add your collections here
  ...HomePageCollection,
  ...PageCollection,
  ...PagePartialCollection,
} as const;

// Astro needs a value for collections that is an object whose keys are collection names
// and whose values are the output of the `defineCollection function`.
// In order to have live data and other niceties, we moved that output to a key called `collection`.
// Therefore we have to extract the `collection` property from each entry in `collectionMap`.
export const collections = Object.entries(collectionMap).reduce<
  Record<string, typeof collectionMap[keyof typeof collectionMap]['collection']>
>((acc, [key, { collection }]) => {
  acc[key] = collection;
  return acc;
}, {});
