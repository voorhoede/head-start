import type { HomeRouteFragment, PageRouteFragment, SiteLocale } from '@lib/types/datocms';
import { getLocale } from '@lib/i18n';

import { getPagePath } from './page';

export type RecordRoute =
  | HomeRouteFragment
  | PageRouteFragment;

export const getHomeHref = ({ locale = getLocale() } = {}) => {
  return `/${locale}/`;
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
  if (record.__typename === 'HomePageRecord') {
    return homeUrl;
  }
  if (record.__typename === 'PageRecord') {
    return `/${locale}/${getPagePath({ page: record, locale })}/`;
  }
  return homeUrl;
};
