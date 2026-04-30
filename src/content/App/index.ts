import { defineCollection, z } from 'astro:content';
import { type AppQuery, App as query, type SiteLocale } from '~/lib/datocms/types';
import { datocmsRequest } from '~/lib/datocms';
import { locales } from '~/lib/i18n';

type Meta = {
  locale: SiteLocale;
};

export type AppCollectionEntry = AppQuery['app'] & {
  id: string;
  meta: Meta;
  noIndex: boolean;
  subscription: { variables: Record<string, string> };
};

const name = 'App' as const;

const loadEntry = async (id: string = 'default', locale?: SiteLocale | null) => {
  const { app, site } = await datocmsRequest<AppQuery>({ query });
  if (!app) return undefined;
  return {
    ...app,
    id,
    meta: {
      locale: locale ?? locales[0],
    },
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
