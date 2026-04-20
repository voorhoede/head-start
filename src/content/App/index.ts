import { defineCollection, z } from 'astro:content';
import { type AppQuery, App as query, type SiteLocale } from '~/lib/datocms/types';
import { datocmsRequest } from '~/lib/datocms';

export type AppCollectionEntry = AppQuery['app'] & {
  id: string;
  meta: Record<string, never>;
  noIndex: boolean;
  subscription: { variables: Record<string, string> };
};

const name = 'App' as const;

const loadEntry = async (_id?: string, _locale?: SiteLocale | null) => {
  const { app, site } = await datocmsRequest<AppQuery>({ query });
  if (!app) return undefined;
  return {
    ...app,
    id: 'default',
    meta: {},
    noIndex: site.noIndex ?? false,
    subscription: { variables: {} },
  } satisfies AppCollectionEntry;
};

const loadCollection = async () => {
  const entry = await loadEntry();
  return entry ? [entry] : [];
};

const collection = defineCollection({
  loader: loadCollection,
  schema: z.custom<AppCollectionEntry>(),
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
