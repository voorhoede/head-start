import { getCollection as getAstroCollection, getEntry as getAstroCollectionEntry } from 'astro:content';
import { PUBLIC_IS_PRODUCTION, HEAD_START_PREVIEW } from 'astro:env/server';
import pagesCollection from './pages';
import type { SiteLocale } from '@lib/i18n/types';
import { combine, split } from './lib/slug';

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
 * @param filter - Optional SiteLocale or function to filter the collection entries
 * @returns A promise that resolves to an array of normalized collection entries
 */
export async function getCollection<Key extends CollectionKey>(
  collection: Key,
  filter?: SiteLocale | ((entry: CollectionEntry<Key>) => boolean),
): Promise<CollectionEntry<Key>[]> {
  const filterFunction = (typeof filter === 'string') 
    ? ({ id }: CollectionEntry<Key>) => {
      const { locale } = split(id);
      return !locale || locale === filter;
    }
    : filter;
  
  return (useLoaderDirectly) 
    ? collectionMap[collection].loader()
      .then(entries => normalizeEntries(entries, collection))
      .then(entries => (filterFunction) ? entries.filter(filterFunction) : entries)
    : getAstroCollection(collection, filterFunction);
}

/**
 * Fetches a single entry from a collection by its slug.
 * 
 * In development and preview environments, the entry is found by filtering the result of the loader.
 * In production environments, data is retrieved using Astro's getEntry function.
 * 
 * @param collection - The key of the collection to fetch the entry from
 * @param slug - The slug (id) of the entry to fetch
 * @param locale - Optional SiteLocale to find the localized entry.
 *                 If a localized entry is not found, any record with that matches the slug is returned.
 * @returns A promise that resolves to the requested collection entry or undefined if not found
 */
export async function getEntry<Key extends CollectionKey>(
  collection: Key,
  slug: string,
  locale?: SiteLocale,
): Promise<CollectionEntry<Key> | undefined> {
  const entry = (useLoaderDirectly)
    ? (await getCollection(collection)).find((entry) => entry.id === combine(slug, locale))
    : await getAstroCollectionEntry(collection, combine(slug, locale));
  
  return (locale) 
    ? entry || await getEntry<Key>(collection, slug, undefined)
    : entry;
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
