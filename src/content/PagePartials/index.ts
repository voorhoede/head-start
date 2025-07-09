import { defineCollection, z } from 'astro:content';
import {
  PagePartialCollectionEntry as query,
  type PagePartialCollectionEntryQuery,
  type SiteLocale,
} from '@lib/datocms/types';
import { datocmsCollection, datocmsRequest } from '@lib/datocms';
import { combine } from '@lib/content';

export type PagePartialCollectionEntry =
  PagePartialCollectionEntryQuery['entry'] & {
    recordId: string;
    id: string;
    locale: SiteLocale;
  };

const name = 'PagePartials' as const;

const loadEntry = async (id: string, locale?: SiteLocale | null) => {
  if (!locale) {
    return;
  }
  const { entry } = await datocmsRequest<PagePartialCollectionEntryQuery>({
    query,
    variables: { id, locale },
  });
  return {
    ...entry,
    recordId: entry.id,
    id: combine({ id: entry.id, locale }),
    locale,
  } satisfies PagePartialCollectionEntry;
};

const loadEntries = async (ids: string[], locale: SiteLocale) => {
  if (!locale) {
    return;
  }
  const entries = await datocmsRequest<PagePartialCollectionEntryQuery>({
    queries: ids.map((id) => ({
      query,
      variables: { id, locale },
    })),
  });

  return entries.map(({ entry }) => {
    return {
      ...entry,
      recordId: entry.id,
      id: combine({ id: entry.id, locale }),
      locale,
    } satisfies PagePartialCollectionEntry;
  });
};

/**
 * Loads all entries from the collection, mapping them to their respective locales.
 *
 * @returns A promise that resolves to an array of PagePartialCollectionEntry objects.
 **/
const loadCollection = async () => {
  const items = (
    await datocmsCollection<{
      id: string;
      _allBlocksLocales: { locale: SiteLocale }[];
    }>({
      collection: name,
      fragment: /* graphql */ `
      id
      # We want all locales for each entry. Since the blocks are localized, 
      # we can fetch the locales via _allBlocksLocales
      _allBlocksLocales {
        locale
      }
    `,
    })
  )
    // Flatten the array of entries to get an array of { id, locale } pairs.
    .flatMap(({ id, _allBlocksLocales }) =>
      _allBlocksLocales.map(({ locale }) => ({ id, locale })),
    );

  // For each id/locale pair, load the entry and return it.
  // Note that this might be slow if there are many entries, as it makes a
  // separate request for each entry.
  const startTime = performance.now();
  console.log(`Loading ${items.length * 4} page partial entries...`);

  const newItems = [...items, ...items, ...items, ...items];

  const result = await loadEntries(
    newItems.map(({ id }) => id),
    items[0].locale,
  );

  if (!result) {
    throw new Error('No entries found');
  }

  const endTime = performance.now();
  console.log(
    `Loaded ${result.length} page partial entries in ${(endTime - startTime).toFixed(2)}ms`,
  );

  return result;
};

const collection = defineCollection({
  loader: loadCollection,
  schema: z.custom<PagePartialCollectionEntry>(),
});

export default {
  [name]: {
    name,
    collection,
    loadCollection,
    loadEntry,
    query,
  },
};
