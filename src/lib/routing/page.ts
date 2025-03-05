import type { PageRouteFragment, SiteLocale } from '@lib/datocms/types';
import { getLocalizedSlug, getSlugFromPath, type MaybeSlug } from './lib/slug';

export function getParentPages(page: PageRouteFragment): PageRouteFragment[] {
  if (page.parentPage) {
    return [
      ...getParentPages(page.parentPage),
      page.parentPage
    ];
  }
  return [];
}

/**
 * Returns a list of slugs for the parent pages of a page.
 * A (parent) page may not be available in all locales, so the list may contain undefined values.
 *
 * Example return values:
 * - []                               (no parent pages)
 * - ['parent-slug']                  (parent page available in given locale)
 * - [undefined]                      (parent page not available in given locale)
 * - ['grand-parent', 'parent-slug']  (grand parent and parent page available in given locale)
 * - ['grand-parent', undefined]      (grand parent page available, parent page not available in given locale)
 */
export const getParentSlugs = ({ locale, page }: { locale?: SiteLocale, page: PageRouteFragment }): MaybeSlug[] => {
  if (page.parentPage) {
    const slug = getLocalizedSlug<PageRouteFragment>({ locale, record: page.parentPage });
    return [
      ...getParentSlugs({ locale, page: page.parentPage }),
      slug
    ];
  }
  return [];
};

/**
 * Returns the URL path for a page based on its slug and the slugs of its parent pages.
 * A (parent) page may not be available in all locales,
 * in which case its slug is replaced with a dash.
 *
 * Example return values:
 * - page-slug
 * - parent-slug/page-slug
 * - grand-parent/parent-slug/page-slug
 * - grand-parent/-/page-slug             (missing parent in given locale)
 * - -/-/page-slug                        (missing parent and grand parent in given locale)
 * - -                                    (missing page in given locale)
 */
export const getPagePath = ({ locale, page }: { locale?: SiteLocale, page: PageRouteFragment }) => {
  const slug = getLocalizedSlug({ locale, record: page });
  const parentSlugs = getParentSlugs({ locale, page });
  return [...parentSlugs, slug].join('/');
};

/**
 * Returns the page slug from a URL path.
 *
 * Returns page-1 in the following examples:
 * - /page-1
 * - /page-1/
 * - /page-1/?foo=bar
 * - /grand-parent/parent-slug/page-1
 */
export const getPageSlugFromPath = (path: URL['pathname']) => 
  getSlugFromPath(path) as string;
