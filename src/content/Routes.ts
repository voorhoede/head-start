import { defineCollection, z } from 'astro:content';
import type { BaseEntry, Collection } from './types';
import type { SiteLocale } from '@lib/datocms/types';

export function createRouteCollection(collections: Record<string, Collection>) {
  const name = 'Routes' as const;
  
  const loadCollection = async (): Promise<BaseEntry[]> => {
    const collectionEntries = await Promise.all(
      Object.values(collections).map((collection) => {
        return collection.loadCollection();
      })
    );
    return collectionEntries.flat();
  };

  const loadEntry = async (
    id: string, 
    locale?: SiteLocale | null
  ): Promise<BaseEntry | undefined> => {
    const entries = await Promise.all(
      Object.values(collections).map((collection) => {
        return collection.loadEntry(id, locale);
      })
    );
    return entries.find((entry) => entry !== undefined);
  };

  const collection = defineCollection({
    loader: loadCollection,
    schema: z.any(),
  });

  return {
    [name]: {
      name,
      collection,
      loadCollection,
      loadEntry,
      subscription: { query: null }, // Union collections don't have a single query
    }
  };
}
