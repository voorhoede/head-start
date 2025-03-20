import type { PageRouteFragment, SiteLocale } from '@lib/datocms/types';

type MaybeSlug = string | undefined;

const missingSlug = '-';

/**
 * Type guard function that checks if a page has a parent page.
 * 
 * This function determines whether the provided parentPage parameter
 * is a valid PageRouteFragment object or null. It's used to safely
 * typecast the parentPage property when traversing page hierarchies.
 */
export function isPage(
  parentPage: PageRouteFragment['parentPage']
): parentPage is PageRouteFragment {
  return parentPage !== null;
}

export function getParentPages(page: PageRouteFragment): PageRouteFragment[] {
  if (isPage(page.parentPage)) {
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
export const getParentSlugs = ({ page, locale }: { page: PageRouteFragment, locale?: SiteLocale }): MaybeSlug[] => {
  if (isPage(page.parentPage)) {
    const slug = page.parentPage._allSlugLocales?.find(slug => slug.locale === locale)?.value;
    return [
      ...getParentSlugs({ page: page.parentPage, locale }),
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
export const getPagePath = ({ page, locale }: { page: PageRouteFragment, locale?: SiteLocale }) => {
  const slug = page._allSlugLocales?.find(slug => slug.locale === locale)?.value || missingSlug;
  const parentSlugs = getParentSlugs({ page, locale }).map(slug => slug || missingSlug);
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
export const getPageSlugFromPath = (path: URL['pathname']) => {
  const url = new URL(path, 'https://www.example.com');
  const slug = url.pathname.split('/').filter(Boolean).pop() as string;
  return slug;
};
