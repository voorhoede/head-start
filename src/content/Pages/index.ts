import { defineCollection, z } from 'astro:content';
import {
  PageCollectionEntry as query,
  type PageCollectionEntryQuery,
  PageRoute as fragment,
  type PageRouteFragment,
  SpecialPageSettings as specialPageSettingsQuery,
  type SiteLocale,
  type SpecialPageSettingsQuery,
} from '@lib/datocms/types';
import { datocmsCollection, datocmsRequest } from '@lib/datocms';
import { combine } from '@lib/content';
import { getPagePath, getParentPages } from '@lib/routing/page';
import {
  formatBreadcrumb,
  getPageHref,
  getSlugFromPath,
  type Breadcrumb,
  type PageUrl,
} from '@lib/routing';
import { isLocale, locales } from '@lib/i18n';

// Certain pages are used for special purposes, such as the homepage, search page, etc.
type SpecialPurposePageType = keyof Omit<
  NonNullable<PageCollectionEntryQuery['app']>,
  '__typename'
> | undefined;

// Add pages that should not be indexed by search engines
const noIndexPages: SpecialPurposePageType[] = [
  'notFoundPage',
];

type Meta = {
  recordId: string; // The record ID of the entry in DatoCMS
  path: string; // The path of the page, excluding the locale
  locale: SiteLocale;
  breadcrumbs: Breadcrumb[]; // Breadcrumbs for the page, used for navigation
  pageUrls: PageUrl[]; // The URL of the page, including the locale
  purpose?: SpecialPurposePageType;
  noIndex: boolean;
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
export async function loadEntry(path: string, locale?: SiteLocale | null) {
  if (!locale) return; // Pages have a locale, so no locale means no entry.
  
  const isHomePage = !path;
  let slug = getSlugFromPath(path) || '';

  // Only the homepage would have no path. If so, fetch the associated slug for the homepage.
  if (isHomePage) {
    const { app: { homePage } } = await datocmsRequest<SpecialPageSettingsQuery>({
      query: specialPageSettingsQuery,
      variables: { locale }
    });
    slug = homePage.slug;
  }

  const variables = { slug, locale };
  const {
    app: { __typename, ...app },
    record
  } = await datocmsRequest<PageCollectionEntryQuery>({ query, variables });

  if (!record) return; // No need for adding metadata if record was not found

  const specialPurposePages = Object.keys(app) as (keyof typeof app)[];
  const purpose: SpecialPurposePageType | undefined = specialPurposePages
    .find(key => app[key].id === record.id);

  // We want to prevent search engines from indexing certain pages.
  // Since homePage is also available under its own slug, we need add noIndex
  // for that specific case.
  const noIndex = (purpose === 'homePage' && !isHomePage) 
    || noIndexPages.includes(purpose) 
    || record.seo?.noIndex 
    || false;

  const breadcrumbs = isHomePage
    ? []
    : [...getParentPages(record), record].map((page) =>
      formatBreadcrumb({
        text: page.title,
        href: getPageHref({ locale, record: page }),
      })
    );

  const pageUrls = (record._allSlugLocales || [])
    .map(({ locale }) => isLocale(locale) && ({
      locale,
      pathname: isHomePage ? `/${locale}` : getPageHref({ locale, record }),
    }))
    .filter(entry => !!entry);

  return {
    ...record,
    id: combine({ id: path, locale }), // Combine the path and locale to create a unique ID for the entry
    meta: {
      recordId: record.id,
      path,
      locale,
      breadcrumbs,
      pageUrls,
      purpose,
      noIndex,
    },
    subscription: {
      variables: { slug, locale },
    },
  } satisfies PageCollectionEntry;
}

/** 
 * Loads all entries from the collection, mapping them to their respective locales.
 * 
 * @returns A promise that resolves to an array of PageCollectionEntry objects.
 **/
async function loadCollection() {
  const contentPages = (await datocmsCollection<PageRouteFragment>({
    collection: name,
    fragment,
  }))
    // Flatten the array of entries to get an array of { id, locale } pairs.
    // In this instance, the `id` of the entry is the path of the page
    .flatMap((record) => (record._allSlugLocales || [])
      .map(({ locale }) => locale && {
        path: getPagePath({ locale, page: record }),
        locale,
        recordId: record.id,
      }).filter((record => !!record))
    );

  // For each id/locale pair, load the entry and return it.
  // Note that this might be slow if there are many entries, as it makes a
  // separate request for each entry.
  return Promise.all([
    // Add homepage entries, those do not have a path.
    ...locales.map(locale => loadEntry('', locale)),
    // Add regular content pages by their path.
    ...contentPages.map(({ path, locale }) => loadEntry(path, locale)),
  ]).then(entries => entries.filter(entry => entry !== undefined));
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
