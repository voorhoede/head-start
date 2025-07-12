import { getCollection as getAstroCollection, getEntry as getAstroCollectionEntry } from 'astro:content';
import { HEAD_START_PREVIEW, PUBLIC_IS_PRODUCTION } from 'astro:env/server';
import { getLocale, isLocale } from '@lib/i18n';
import { SiteLocale } from '@lib/datocms/types';
import { collectionMap } from '@content/config';

export type CollectionName = keyof typeof collectionMap;

type BareCollectionEntry<K extends CollectionName> = NormalizedEntry<
  Awaited<ReturnType<typeof collectionMap[K]['loadCollection']>>[number]
>
type CollectionSubscription<K extends CollectionName> = {
  query: typeof collectionMap[K]['subscription']['query']; // The GraphQL query for the subscription
  variables: CollectionEntry<K>['data']['subscription']['variables']; // Variables for the subscription
}
/**
 * CollectionEntry is a type that represents a single entry in a collection.
 */ 
export type CollectionEntry<K extends CollectionName> = BareCollectionEntry<K> & { 
  subscription: CollectionSubscription<K> 
};

const useLiveData = !PUBLIC_IS_PRODUCTION || HEAD_START_PREVIEW;
/**
 * Fetches entries from a collection.
 *
 * @param collection - The key of the collection to fetch entries from
 * @param filter - Optional function to filter the collection entries
 * @param locale - SiteLocale to filter on, defaults to current locale. Use `null` for all locales.
 * @returns A promise that resolves to an array of normalized collection entries
 */
export async function getCollection<K extends CollectionName>(
  collection: K,
  filter?: ((entry: BareCollectionEntry<K>) => boolean),
  locale: SiteLocale | null = getLocale(),
): Promise<CollectionEntry<K>[]> {
  const entries = (!filter && !locale) 
    ? await getAstroCollection(collection)
    : await getAstroCollection(collection, (entry: BareCollectionEntry<K>) => {
      const entryLocale = split(entry.id).locale;
      return [
        // Check if the entry's locale is set and matches the requested locale
        !locale || !entryLocale || entryLocale === locale,
        // If a filter function is provided, apply it to the entry
        !filter || (typeof filter === 'function' && filter(entry)),
      ].every(Boolean);
    });
  
  return entries.map(entry => addSubscription(entry, collection));
}

/**
 * Fetches a single entry from a collection by its slug.
 *
 * @param collection - The key of the collection to fetch the entry from
 * @param id - The id of the entry to fetch or undefined for singleton collections
 * @param locale - Optional SiteLocale to find the localized entry.
 * @returns A promise that resolves to the requested collection entry or undefined if not found
 */
export async function getEntry<K extends CollectionName>(
  collection: K,
  id: string = '', // Default to empty string for singleton collections
  locale: SiteLocale | null = getLocale(),
): Promise<CollectionEntry<K> | undefined> {
  let entry: BareCollectionEntry<K> | undefined = undefined;
  
  if (useLiveData) {
    const liveEntry = await collectionMap[collection].loadEntry(id, locale);
    if (liveEntry) {
      entry = normalizeEntry(liveEntry, collection);
    }
  } else {
    entry = await getAstroCollectionEntry(collection, combine({ id, locale }));
  }
  
  if (!entry) {
    return (locale) 
      ? await getEntry(collection, id, null) // Retry once to the entry without locale if not found
      : undefined; // If no locale is provided, return undefined if the entry is not found
  }
  
  return addSubscription(entry, collection);
}

export type BaseEntry = { 
  id: string;
  subscription: {
    variables: Record<string, string>; // Variables for the subscription
  };
};
export type NormalizedEntry<T extends BaseEntry = BaseEntry> = {
  id: string;
  collection: string;
  data: T;
};

/**
 * Wrap an entry from loadCollection in a format that corresponds to Astro's 
 * getCollection return type.
 */
function normalizeEntry<T extends BaseEntry>(entry: T, collection: CollectionName): NormalizedEntry<T> {
  return {
    id: entry.id,
    collection,
    data: entry as T,
  };
}

function addSubscription<T extends BareCollectionEntry<K>, K extends CollectionName>(
  entry: T,
  collection: K,
): CollectionEntry<K> {
  const { query } = collectionMap[collection].subscription;
  const { variables } = entry.data.subscription;
  return {
    ...entry,
    subscription: { query, variables },
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
