import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import {
  HomePageCollectionEntry as query,
  type HomePageCollectionEntryQuery,
} from '~/lib/datocms/types';
import type { SiteLocale } from '~/lib/datocms/schema';
import { datocmsRequest } from '~/lib/datocms';
import { combine } from '~/lib/content';
import { locales } from '~/lib/i18n';

type Meta = {
  locale: SiteLocale;
  recordId: string;
};
type QueryVariables = {
  locale: SiteLocale;
};
export type HomePageCollectionEntry = HomePageCollectionEntryQuery['record'] & {
  id: string;
  meta: Meta;
  subscription: {
    variables: QueryVariables;
  };
};

const name = 'HomePage' as const;

/**
 * Loads the home page for a locale. The home page is a singleton,
 * so the only id is 'default'.
 */
const loadEntry = async (id: string = 'default', locale?: SiteLocale | null) => {
  if (!locale) {
    return undefined;
  }
  const variables = { locale };
  const { record } = await datocmsRequest<HomePageCollectionEntryQuery>({ query, variables });
  if (!record) {
    return undefined;
  }
  return {
    ...record,
    id: combine({ id, locale }),
    meta: {
      locale,
      recordId: record.id,
    },
    subscription: { variables },
  } satisfies HomePageCollectionEntry;
};

const loadCollection = async () => {
  const entries = await Promise.all(locales.map((locale) => loadEntry('default', locale)));
  return entries.filter(entry => entry !== undefined);
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
  },
};
