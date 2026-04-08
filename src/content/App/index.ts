import { defineCollection, z } from 'astro:content';
import { type AppQuery, App as query } from '~/lib/datocms/types';
import { datocmsRequest } from '~/lib/datocms';

export type AppCollectionEntry = AppQuery['app'] & {
  id: string;
  meta: Record<string, never>;
  subscription: { variables: Record<string, never> };
};

const name = 'App' as const;

const loadEntry = async () => {
  const { app } = await datocmsRequest<AppQuery>({ query });
  if (!app) return undefined;
  return {
    ...app,
    id: 'default',
    meta: {},
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
