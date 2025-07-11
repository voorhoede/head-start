import { defineCollection, z } from 'astro:content';
import {
  PagePartialCollectionEntry as query,
  type PagePartialCollectionEntryQuery,
  type SiteLocale
} from '@lib/datocms/types';
import { datocmsCollection, datocmsRequest } from '@lib/datocms';
import { combine } from '@lib/content';

type Meta = {
  locale: SiteLocale;
  recordId: string;
};
type QueryVariables = {
  id: string;
  locale: SiteLocale;
};
export type PagePartialCollectionEntry = PagePartialCollectionEntryQuery['entry'] & {
  id: string;
  meta: Meta;
  subscription: { 
    variables: QueryVariables;
  };
};

const name = 'PagePartials' as const;

const loadEntry = async (id: string, locale?: SiteLocale | null) => {
  if (!locale) {
    return;
  }
  const variables = { id, locale };
  const { entry } = await datocmsRequest<PagePartialCollectionEntryQuery>({ query, variables });
  return {
    ...entry,
    id: combine({ id: entry.id, locale }),
    meta: {
      recordId: entry.id,  
      locale,
    },
    subscription: { variables },
  } satisfies PagePartialCollectionEntry;
};

/** 
 * Loads all entries from the collection, mapping them to their respective locales.
 * 
 * @returns A promise that resolves to an array of PagePartialCollectionEntry objects.
 **/
const loadCollection = async () => {
  const items = (await datocmsCollection<{ 
    id: string, 
    _allBlocksLocales: { locale: SiteLocale }[] 
  }>({
    collection: name,
    fragment: /* graphql */`
      id
      # We want all locales for each entry. Since the blocks are localized, 
      # we can fetch the locales via _allBlocksLocales
      _allBlocksLocales {
        locale
      }
    `,
  }))
    // Flatten the array of entries to get an array of { id, locale } pairs.
    .flatMap(({ id, _allBlocksLocales }) => _allBlocksLocales
      .map(({ locale }) => ({ id, locale })) 
    );

  // For each id/locale pair, load the entry and return it.
  // Note that this might be slow if there are many entries, as it makes a
  // separate request for each entry.
  return await Promise.all(items.map(({ id, locale }) => loadEntry(id, locale)))
    .then(entries => entries.filter( entry => entry !== undefined));
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
    subscription: { query },
  }
};
