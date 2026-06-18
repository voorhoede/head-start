import type { FileRouteFragment, HomeRouteFragment, PageRouteFragment } from '~/lib/datocms/types';
import type { SiteLocale } from '~/lib/datocms/schema';
import { getLocale } from '~/lib/i18n';
import { getPagePath, type PageRouteWithParents } from './page';
import { getFileHref } from './file';

export type PageUrl = {
  locale: SiteLocale,
  pathname: string,
};

export type RecordRoute =
  | FileRouteFragment
  | HomeRouteFragment
  | PageRouteFragment;

export { getFileHref } from './file';
export { formatBreadcrumb, type Breadcrumb } from './lib/breadcrumbs';
export { getSlugFromPath } from './lib/slug';
export { htmlToMarkdownPath, isMarkdownApiPath, markdownToHtmlPath } from './markdown';

export const getHomeHref = ({ locale = getLocale() } = {}) => {
  return `/${locale}/`;
};

export const getPageHref = ({ locale, record }: { locale: SiteLocale, record: PageRouteWithParents }) => {
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
