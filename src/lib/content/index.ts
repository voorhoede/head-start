import { getCollection as getAstroCollection, getEntry as getAstroCollectionEntry } from 'astro:content';
import { HEAD_START_PREVIEW, PUBLIC_IS_PRODUCTION } from 'astro:env/server';
import { getLocale, isLocale } from '@lib/i18n';
import { SiteLocale } from '@lib/datocms/types';
import { collectionMap } from '@content/config';

export type CollectionName = keyof typeof collectionMap;
/**
 * CollectionEntry is a type that represents a single entry in a collection.
 */ 
export type CollectionEntry<Key extends CollectionName> = NormalizedEntry<
  Awaited<ReturnType<typeof collectionMap[Key]['loadCollection']>>[number]
>;

const useLiveData = !PUBLIC_IS_PRODUCTION || HEAD_START_PREVIEW;
/**
 * Fetches entries from a collection.
 *
 * @param collection - The key of the collection to fetch entries from
 * @param filter - Optional SiteLocale or function to filter the collection entries
 * @returns A promise that resolves to an array of normalized collection entries
 */
export async function getCollection<Key extends CollectionName>(
  collection: Key,
  filter?: ((entry: CollectionEntry<Key>) => boolean),
  locale: SiteLocale | null = getLocale(),
): Promise<CollectionEntry<Key>[]> {
  if (!filter && !locale) {
    return getAstroCollection(collection);
  }
  
  return getAstroCollection(collection, (entry: CollectionEntry<Key>) => {
    const entryLocale = split(entry.id).locale;
    return [
      // Check if the entry's locale is set and matches the requested locale
      !locale || !entryLocale || entryLocale === locale,
      // If a filter function is provided, apply it to the entry
      !filter || (typeof filter === 'function' && filter(entry)),
    ].every(Boolean);
  });
}

/**
 * Fetches a single entry from a collection by its slug.
 *
 * @param collection - The key of the collection to fetch the entry from
 * @param id - The id of the entry to fetch
 * @param locale - Optional SiteLocale to find the localized entry.
 * @returns A promise that resolves to the requested collection entry or undefined if not found
 */
export async function getEntry<Key extends CollectionName>(
  collection: Key,
  id: string,
  locale: SiteLocale | null = getLocale(),
): Promise<CollectionEntry<Key> | undefined> {
  let entry: CollectionEntry<Key> | undefined = undefined;
  
  if (useLiveData) {
    const liveEntry = await collectionMap[collection].loadEntry(id, locale);
    if (liveEntry) {
      entry = normalizeEntry(liveEntry, collection);
    }
  } else {
    entry = await getAstroCollectionEntry(collection, combine({ id, locale }));
  }
  
  return (locale)
    ? entry || await getEntry(collection, id, null) // Retry once to the entry without locale if not found
    : entry;
}

type Entry = { id: string; };
type NormalizedEntry<T extends Entry> = {
  id: string;
  collection: string;
  data: T;
};

/**
 * Wrap an entry from loadCollection in a format that corresponds to Astro's 
 * getCollection return type.
 */
function normalizeEntry<T extends Entry>(entry: T, collection: string): NormalizedEntry<T> {
  return {
    id: entry.id,
    collection: collection,
    data: entry as T,
  };
}

export function combine({ id, locale }: { id: string, locale?: SiteLocale | null }) {
  return locale ? `${locale}/${id}` : id;
}

export function split(value: string) {
  let locale: SiteLocale | null = null;
  let id = value;
  const [first, ...rest] = value.split('/');
  
  if (isLocale(first)) {
    locale = first;
    id = rest.join('/');
  }
  
  return { id, locale };
}
