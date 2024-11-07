import type { FileRouteFragment, HomeRouteFragment, PageRouteFragment, SiteLocale } from '@lib/datocms/types';
import { datocmsAssetsOrigin } from '@lib/datocms';
import { getLocale } from '@lib/i18n';
import { getPagePath } from './page';

export type RecordRoute =
  | FileRouteFragment
  | HomeRouteFragment
  | PageRouteFragment;

export const getFileHref = (record: FileRouteFragment) => {
  return record.file.url.replace(datocmsAssetsOrigin, '/files/');
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
