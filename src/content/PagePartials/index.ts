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
export type PagePartialCollectionEntry = PagePartialCollectionEntryQuery['record'] & {
  id: string;
  meta: Meta;
  subscription: {
    variables: QueryVariables;
  };
};

const name = 'PagePartials' as const;

async function loadEntry(recordId: string, locale?: SiteLocale | null) {
  if (!locale) {
    return;
  }
  const variables = { id: recordId, locale };
  const { record } = await datocmsRequest<PagePartialCollectionEntryQuery>({ query, variables });
  return {
    ...record,
    id: combine({ id: recordId, locale }),
    meta: {
      recordId,
      locale,
    },
    subscription: { variables },
  } satisfies PagePartialCollectionEntry;
}

/** 
 * Loads all entries from the collection, mapping them to their respective locales.
 * 
 * @returns A promise that resolves to an array of PagePartialCollectionEntry objects.
 **/
async function loadCollection() {
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
    // Flatten the array of entries to get an array of { recordId, locale } pairs.
    .flatMap(({ id, _allBlocksLocales }) => _allBlocksLocales
      .map(({ locale }) => ({ recordId: id, locale }))
    );

  // For each recordId/locale pair, load the entry and return it.
  // Note that this might be slow if there are many entries, as it makes a
  // separate request for each entry.
  return await Promise.all(items.map(({ recordId, locale }) => loadEntry(recordId, locale)))
    .then(entries => entries.filter(entry => entry !== undefined));
}

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
