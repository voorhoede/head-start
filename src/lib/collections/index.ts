import { getCollection as getAstroCollection, getEntry as getAstroCollectionEntry } from 'astro:content';
import { PUBLIC_IS_PRODUCTION, HEAD_START_PREVIEW } from 'astro:env/server';
import pagesCollection from './pages';

export const collectionMap = {
  ...pagesCollection,
  // Add more collectionMap here
} as const;

const useLoaderDirectly = !PUBLIC_IS_PRODUCTION || HEAD_START_PREVIEW;

type CollectionKey = keyof typeof collectionMap;
type CollectionEntry<Key extends CollectionKey> = NormalizedEntry<
  Awaited<ReturnType<typeof collectionMap[Key]['loader']>>[number]
>;

/**
 * Fetches entries from a collection.
 * 
 * In development and preview environments, data is loaded directly using the collection loader.
 * In production environments, data is retrieved using Astro's getCollection function.
 * 
 * @param collection - The key of the collection to fetch entries from
 * @param filter - Optional function to filter the collection entries
 * @returns A promise that resolves to an array of normalized collection entries
 */
export async function getCollection<Key extends CollectionKey>(
  collection: Key,
  filter?: (entry: CollectionEntry<Key>) => boolean,
): Promise<CollectionEntry<Key>[]> {
  return (useLoaderDirectly) 
    ? collectionMap[collection].loader()
      .then(entries => normalizeEntries(entries, collection))
      .then(entries => (filter) ? entries.filter(filter) : entries)
    : getAstroCollection(collection, filter);
}

/**
 * Fetches a single entry from a collection by its slug.
 * 
 * In development and preview environments, the entry is found by filtering the result of the loader.
 * In production environments, data is retrieved using Astro's getEntry function.
 * 
 * @param collection - The key of the collection to fetch the entry from
 * @param slug - The slug (id) of the entry to fetch
 * @returns A promise that resolves to the requested collection entry or undefined if not found
 */
export async function getEntry<Key extends CollectionKey>(
  collection: Key,
  slug: string,
) {
  return (useLoaderDirectly)
    ? (await getCollection(collection)).find((entry) => entry.id === slug)
    : getAstroCollectionEntry(collection, slug);
}

type Entry = { id: string; };
type NormalizedEntry<T extends Entry> = {
  id: string;
  collection: string;
  data: T;
};

function normalizeEntries<T extends Entry>(entries: T[], collection: string): NormalizedEntry<T>[] {
  return entries.map(item => ({
    id: item.id,
    collection: collection,
    data: item,
  }));
}
