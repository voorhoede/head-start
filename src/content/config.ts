// Astro expects a content/config.ts file, therefore we export the collections here.
import HomePageCollection from './Home';
import PageCollection from './Pages';
import PagePartialCollection from './PagePartials';
import { createRouteCollection } from './Routes';
import type { Collection } from './types';

const routeCollectionMap = {
  // Collections for which every entry should have a route must be added here.
  // For example, every page in the Pages collection should have a route.
  ...HomePageCollection,
  ...PageCollection,
} as const;

const nonRouteCollectionMap = {
  // When collection entries do not have a route, add them here.
  // For example, the PagePartials collection is used to render page content,
  // and is not available as a route.
  ...PagePartialCollection,
} as const;

export const collectionMap = {
  ...routeCollectionMap,
  ...nonRouteCollectionMap,
  // Includes a union of all route-based collections
  ...createRouteCollection(routeCollectionMap),
} as const satisfies Record<Collection['name'], Collection>;

// Astro needs a value for collections that is an object whose keys are collection names
// and whose values are the output of the `defineCollection function`.
// In order to have live data and other niceties, we moved that output to a key called `collection`.
// Therefore we have to extract the `collection` property from each entry in `collectionMap`.
export const collections = Object.entries(collectionMap).reduce<
  Record<string, typeof collectionMap[keyof typeof collectionMap]['collection']>
>((acc, [key, { collection }]) => {
  acc[key] = collection;
  return acc;
}, {}) satisfies Record<Collection['name'], Collection['collection']>;
