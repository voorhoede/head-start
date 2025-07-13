import type { SiteLocale } from '@lib/datocms/types';
import { defineCollection } from 'astro:content';

/**
 * Generic Collection type to aid in defining new collections
 */
export type Collection<
  K extends string = string,
  T extends BaseEntry = BaseEntry,
  Q = unknown
> = {
  name: K;
  collection: ReturnType<typeof defineCollection>;
  loadCollection: () => Promise<T[]>;
  loadEntry: (id: string, locale?: SiteLocale | null) => Promise<T | undefined>;
  subscription: {
    query: Q;
  },
};

/**
 * Base entry for populating content collections.
 * Note that this differs from the return type of getCollection and getEntry.
 */
export type BaseEntry = { 
  id: string;
  subscription: {
    variables: Record<string, string>; // Variables for the subscription
  };
};
