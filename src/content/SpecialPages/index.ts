import { defineCollection, z } from 'astro:content';
import {
  PageCollectionEntry as query,
  SpecialPageSettings as specialPagesQuery,
  type SpecialPageSettingsQuery,
  type SiteLocale,
} from '@lib/datocms/types';
import { datocmsRequest } from '@lib/datocms';
import { getPagePath } from '@lib/routing/page';
import { loadEntry as loadPageEntry, type PageCollectionEntry } from '@content/Pages';
import { combine } from '@lib/content';

const name = 'SpecialPages' as const;

/**
 * Loads a single entry from the collection by its ID and locale.
 * 
 * @param purpose - The purpose of the page, which is used as the key in the app settings.
 * @param locale - The locale of the entry to load.
 * @param path - The path of the entry to load. If provided, it will be used to load the entry from the Pages collection directly.
 * @returns A promise that resolves to a PageCollectionEntry object or undefined if not found.
 */
export const loadEntry = async (purpose: string, locale?: SiteLocale | null, path?: string) => {
  if (path) {
    const entry = await loadPageEntry(path, locale);
    return entry && {
      ...entry,
      id: combine({ id: purpose, locale }),
    };
  }

  return loadCollection().then(entries => entries
    .find(entry => entry.id === combine({ id: purpose, locale }))
  );
};

/** 
 * Loads all entries from the collection, mapping them to their respective locales.
 * 
 * @returns A promise that resolves to an array of PageCollectionEntry objects.
 **/
export const loadCollection = async (): Promise<PageCollectionEntry[]> => {
  const {
    app: { 
      __typename,
      ...specialPages 
    }
  } = await datocmsRequest<SpecialPageSettingsQuery>({ 
    query: specialPagesQuery 
  });
  const items = Object.entries(specialPages).flatMap(
    ([purpose, record]) => (record._allSlugLocales || [])
      .map(({ locale }) => locale && {
        purpose, // The purpose of the page is the key in the app settings.
        path: getPagePath({ locale, page: record }),
        locale,
        recordId: record.id,
      }).filter((record => !!record))
  );

  // For each id/locale pair, load the entry and return it.
  // Note that this might be slow if there are many entries, as it makes a
  // separate request for each entry.
  return Promise.all(
    items.map(({ path, purpose, locale }) => loadEntry(purpose, locale, path))
  ).then(entries => entries.filter(entry => entry !== undefined));
};

const collection = defineCollection({
  loader: loadCollection,
  schema: z.custom<PageCollectionEntry>(),
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
