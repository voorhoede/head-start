import type { FileRouteFragment, HomeRouteFragment, PageRouteFragment, SiteLocale } from '@lib/datocms/types';
import { getLocale } from '@lib/i18n';
import { getPagePath } from './page';
import { getFileHref } from './file';

export type RecordRoute =
  | FileRouteFragment
  | HomeRouteFragment
  | PageRouteFragment;

export { getFileHref } from './file';

export const isStaticRoute = (record: RecordRoute) => {
  // POC implementation to show the idea,
  // actual implementation ought to be based on a either a setting per page or the existence of ceertain blocks?
  // @ts-expect-error _allSlugLocales might not exist on all records
  return !record._allSlugLocales?.some((slug: unknown) => slug.value === ('demos'));
};

export const isServerRoute = (record: RecordRoute) => {
  return !isStaticRoute(record);
};

export const getHomeHref = ({ locale = getLocale() } = {}) => {
  return `/${locale}/`;
};

export const getPageHref = ({ locale, record }: { locale: SiteLocale, record: PageRouteFragment }) => {
  return `/${locale}/${getPagePath({ page: record, locale })}/`;
};

/**
 * Determine pathname based on locale and record type
 */
export const getHref = (
  { locale, record }: { locale: SiteLocale, record: RecordRoute }
) => {
  const homeUrl = getHomeHref({ locale });
  if (!record) {
    return homeUrl;
  }
  if (record.__typename === 'FileRecord') {
    return getFileHref(record);
  }
  if (record.__typename === 'HomePageRecord') {
    return homeUrl;
  }
  if (record.__typename === 'PageRecord') {
    return getPageHref({ locale, record });
  }
  return homeUrl;
};
