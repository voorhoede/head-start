import { defineCollection, z } from 'astro:content';
import {
  FormCollectionEntry as query,
  type FormCollectionEntryQuery,
  type SiteLocale,
} from '@lib/datocms/types';
import { datocmsCollection, datocmsRequest } from '@lib/datocms';
import { combine } from '@lib/content';

type QueryVariables = {
  slug: string;
  locale: SiteLocale;
};
export type FormCollectionEntry = FormCollectionEntryQuery['record'] & {
  id: string;
  subscription: {
    variables: QueryVariables;
  };
};

const name = 'Forms' as const;

const loadEntry = async (slug: string, locale?: SiteLocale | null) => {
  if (!locale) {
    return;
  }
  const variables = { slug, locale };
  const { record } = await datocmsRequest<FormCollectionEntryQuery>({
    query,
    variables,
  });
  return {
    ...record,
    id: combine({ id: slug, locale }),
    subscription: { variables },
  } satisfies FormCollectionEntry;
};

/**
 * Loads all entries from the collection, mapping them to their respective locales.
 *
 * @returns A promise that resolves to an array of FormCollectionEntry objects.
 **/
const loadCollection = async () => {
  const items = (
    await datocmsCollection<{
      slug: string;
      _allTitleLocales: { locale: SiteLocale }[];
    }>({
      collection: name,
      fragment: /* graphql */ `
      slug
      # We want all locales for each entry. Since the blocks are localized,
      # we can fetch the locales via _allTitleLocales
      _allTitleLocales {
        locale
      }
    `,
    })
  ).flatMap(({ slug, _allTitleLocales }) =>
    _allTitleLocales.map(({ locale }) => ({ slug, locale })),
  );
  return await Promise.all(
    items.map(({ slug, locale }) => loadEntry(slug, locale)),
  ).then((entries) => entries.filter((entry) => entry !== undefined));
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
    subscription: { query },
  },
};
