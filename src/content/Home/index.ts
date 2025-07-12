import { defineCollection, z } from 'astro:content';
import {
  HomePageCollectionEntry as query,
  type HomePageCollectionEntryQuery,
  type SiteLocale
} from '@lib/datocms/types';
import { datocmsRequest } from '@lib/datocms';
import { combine } from '@lib/content';
import { locales } from '@lib/i18n';
import { getHomeHref, type PageUrl } from '@lib/routing';

type Meta = {
  recordId: string; // The record ID of the entry in DatoCMS
  locale: SiteLocale;
  pageUrls: PageUrl[]; // The URL of the page, including the locale
};
type QueryVariables = {
  locale: SiteLocale;
};
export type HomePageCollectionEntry = HomePageCollectionEntryQuery['entry'] & {
  id: string, // A unique ID for the entry in the content collection, combining the path and locale
  meta: Meta,
  subscription: {
    variables: QueryVariables // Variables for the subscription
  }
};

const name = 'Home' as const;

/**
 * Loads a single entry from the collection by its ID and locale.
 * 
 * @param id - empty string because this collection only has one entry.
 * @param locale - The locale of the entry to load.
 * @returns A promise that resolves to a HomePageCollectionEntry object or undefined if not found.
 */
const loadEntry = async (id: string, locale?: SiteLocale | null) => {
  // A truthy value for `id` is not expected, as this collection only has one entry.
  if (id || !locale) {
    return undefined;
  }

  const variables = { locale };
  const { entry } = await datocmsRequest<HomePageCollectionEntryQuery>({ query, variables });
  
  if (!entry) {
    return undefined; // If no entry is found, return undefined
  }
  
  const pageUrls = locales.map((locale) => ({
    locale,
    pathname: getHomeHref({ locale }),
  }));

  return {
    ...entry,
    id: combine({ id, locale }), // Combine the path and locale to create a unique ID for the entry
    meta: {
      recordId: entry.id,
      locale,
      pageUrls,
    },
    subscription: {
      variables: { locale },
    },
  } satisfies HomePageCollectionEntry;
};

/** 
 * Loads all entries from the collection, mapping them to their respective locales.
 * 
 * @returns A promise that resolves to an array of HomePageCollectionEntry objects.
 **/
const loadCollection = async () => {
  return Promise.all(locales.map((locale) => loadEntry('', locale)))
    .then(entries => entries.filter(entry => !!entry));
};

const collection = defineCollection({
  loader: loadCollection,
  schema: z.custom<HomePageCollectionEntry>(),
});

export default {
  [name]: {
    name,
    collection,
    loadCollection,
    loadEntry,
    subscription: { query },
  }
};
