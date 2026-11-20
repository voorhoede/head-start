import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { type AppQuery, App as query } from '~/lib/datocms/types';
import type { SiteLocale } from '~/lib/datocms/schema';
import { datocmsRequest } from '~/lib/datocms';
import { combine } from '~/lib/content';
import { locales } from '~/lib/i18n';

type Meta = {
  locale: SiteLocale;
};
type QueryVariables = {
  locale: SiteLocale;
};

export type AppCollectionEntry = AppQuery['app'] & {
  id: string;
  meta: Meta;
  noIndex: boolean;
  site: AppQuery['site'];
  subscription: { variables: QueryVariables };
};

const name = 'App' as const;

const loadEntry = async (id: string = 'default', locale?: SiteLocale | null) => {
  if (!locale) {
    return undefined;
  }
  const variables = { locale };
  const { app, site } = await datocmsRequest<AppQuery>({ query, variables });
  if (!app) return undefined;
  return {
    ...app,
    id: combine({ id, locale }),
    meta: {
      locale,
    },
    noIndex: site.noIndex ?? false,
    site,
    subscription: { variables },
  } satisfies AppCollectionEntry;
};

/**
 * Loads the App entry for each locale.
 */
const loadCollection = async () => {
  const entries = await Promise.all(locales.map((locale) => loadEntry('default', locale)));
  return entries.filter(entry => entry !== undefined);
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
