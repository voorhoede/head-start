import type { FileRouteFragment, PageRouteFragment, SiteLocale } from '@lib/datocms/types';
import { getLocale } from '@lib/i18n';
import { getPagePath } from './page';
import { getFileHref } from './file';

export type PageUrl = {
  locale: SiteLocale,
  pathname: string,
};

export type RecordRoute =
  | FileRouteFragment
  | PageRouteFragment;

export { getFileHref } from './file';
export { formatBreadcrumb, type Breadcrumb } from './lib/breadcrumbs';
export { getSlugFromPath } from './lib/slug';

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
  if (record.slug === 'home') {
    return homeUrl;
  }
  if (record.__typename === 'PageRecord') {
    return getPageHref({ locale, record });
  }
  return homeUrl;
};
