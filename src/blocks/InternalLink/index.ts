import type { PageRecord, SiteLocale } from '@lib/types/datocms';

type AnyPage = PageRecord;

export const getParentPages = (page: AnyPage): AnyPage[] => {
  if (page.parentPage) {
    return [
      ...getParentPages(page.parentPage),
      page.parentPage
    ];
  }
  return [];
};

export const getParentSlugs = ({ page, locale }: { page: AnyPage, locale: SiteLocale }): string[] => {
  if (page.parentPage) {
    const slug = page.parentPage._allSlugLocales?.find(slug => slug.locale === locale)?.value;
    return [
      ...getParentSlugs({ page: page.parentPage, locale }), 
      slug
    ].filter(Boolean) as string[];
  }
  return [];
};

export const getPagePath = ({ page, locale }: { page: AnyPage, locale: SiteLocale }) => {
  const slug = page._allSlugLocales?.find(slug => slug.locale === locale)?.value || page.slug;
  const parentSlugs = getParentSlugs({ page, locale });
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
