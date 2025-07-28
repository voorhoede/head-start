import { defineCollection, z } from 'astro:content';
import {
  FormCollectionEntry as query,
  type FormCollectionEntryQuery,
  type SiteLocale
} from '@lib/datocms/types';
import { datocmsCollection, datocmsRequest } from '@lib/datocms';
import { combine } from '@lib/content';

export type FormCollectionEntry = FormCollectionEntryQuery['entry'] & {
  recordId: string,
  id: string,
  locale: SiteLocale,
  path: string, // forms are also routes
  // isStatic: false,
  // noIndex: true,
};

const name = 'Forms' as const;

const loadEntry = async (id: string, locale?: SiteLocale | null) => {
  if (!locale) {
    return;
  }
  const { record } = await datocmsRequest<FormCollectionEntryQuery>({ query, variables: { id, locale } });
  return {
    ...record,
    recordId: record.id,
    id: combine({ id: record.id, locale }),
    locale,
    path: `/${locale}/forms/${record.id}`,
  } satisfies FormCollectionEntry;
};

/** 
 * Loads all entries from the collection, mapping them to their respective locales.
 * 
 * @returns A promise that resolves to an array of FormCollectionEntry objects.
 **/
const loadCollection = async () => {
  const items = (await datocmsCollection<{ 
    id: string, 
    locale: SiteLocale,
  }>({
    collection: name,
    fragment: /* graphql */`
      id,
      locale
    `,
  }));

  // For each id/locale pair, load the entry and return it.
  // Note that this might be slow if there are many entries, as it makes a
  // separate request for each entry.
  return await Promise.all(items.map(({ id, locale }) => loadEntry(id, locale)))
    .then(entries => entries.filter( entry => entry !== undefined));
};

const collection = defineCollection({
  loader: loadCollection,
  schema: z.custom<FormCollectionEntry>(),
});

export default {
  [name]: {
    name,
    collection,
    loadCollection,
    loadEntry,
    query,
  }
};
