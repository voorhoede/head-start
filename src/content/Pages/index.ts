import { combine } from '@lib/content';
import { datocmsCollection, datocmsRequest } from '@lib/datocms';
import {
  PageRoute as fragment,
  PageCollectionEntry as query,
  type PageCollectionEntryQuery,
  type PageRouteFragment,
  type SiteLocale
} from '@lib/datocms/types';
import { isLocale } from '@lib/i18n';
import {
  formatBreadcrumb,
  getPageHref,
  getSlugFromPath,
  type Breadcrumb,
  type PageUrl,
} from '@lib/routing';
import { getPagePath, getParentPages } from '@lib/routing/page';
import { defineCollection, z } from 'astro:content';

type Meta = {
  recordId: string; // The record ID of the entry in DatoCMS
  recordType: string; // The type of the record in DatoCMS
  path: string; // The path of the page, excluding the locale
  locale: SiteLocale;
  breadcrumbs: Breadcrumb[]; // Breadcrumbs for the page, used for navigation
  pageUrls: PageUrl[]; // The URL of the page, including the locale
};
type QueryVariables = {
  slug: string;
  locale: SiteLocale;
};
export type PageCollectionEntry = PageCollectionEntryQuery['record'] & {
  id: string, // A unique ID for the entry in the content collection, combining the path and locale
  meta: Meta,
  subscription: {
    variables: QueryVariables // Variables for the subscription
  }
};

const name = 'Pages' as const;

/**
 * Loads a single entry from the collection by its ID and locale.
 * 
 * @param path - The path of the entry to load.
 * @param locale - The locale of the entry to load.
 * @returns A promise that resolves to a PageCollectionEntry object or undefined if not found.
 */
const loadEntry = async (path: string, locale?: SiteLocale | null) => {
  const slug = getSlugFromPath(path);

  if (!slug || !locale) {
    return undefined;
  }

  const variables = { slug, locale };
  const { record } = await datocmsRequest<PageCollectionEntryQuery>({ query, variables });

  if (!record) {
    return undefined; // If no entry is found, return undefined
  }

  const breadcrumbs = [...getParentPages(record), record].map((page) =>
    formatBreadcrumb({
      text: page.title,
      href: getPageHref({ locale, record: page }),
    })
  );
  const pageUrls = (record._allSlugLocales || [])
    .map(({ locale }) => isLocale(locale) && ({
      locale,
      pathname: getPageHref({ locale, record }),
    }))
    .filter(entry => !!entry);

  return {
    ...record,
    id: combine({ id: path, locale }), // Combine the path and locale to create a unique ID for the entry
    meta: {
      recordId: record.id,
      recordType: record.__typename,
      path,
      locale,
      breadcrumbs,
      pageUrls,
    },
    subscription: {
      variables: { slug, locale },
    },
  } satisfies PageCollectionEntry;
};

/** 
 * Loads all entries from the collection, mapping them to their respective locales.
 * 
 * @returns A promise that resolves to an array of PageCollectionEntry objects.
 **/
const loadCollection = async () => {
  const items = (await datocmsCollection<PageRouteFragment>({
    collection: name,
    fragment,
  }))
    // Flatten the array of entries to get an array of { id, locale } pairs.
    // In this instance, the `id` of the entry is the path of the page
    .flatMap((record) => (record._allSlugLocales || [])
      .map(({ locale }) => locale && {
        path: getPagePath({ locale, page: record }),
        locale,
      }).filter((record => !!record))
    );

  // For each id/locale pair, load the entry and return it.
  // Note that this might be slow if there are many entries, as it makes a
  // separate request for each entry.
  return Promise.all(items.map(({ path, locale }) => loadEntry(path, locale)))
    .then(entries => entries.filter(entry => entry !== undefined));
};

const collection = defineCollection({
  loader: loadCollection,
  schema: z.custom<PageCollectionEntry>(),
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
