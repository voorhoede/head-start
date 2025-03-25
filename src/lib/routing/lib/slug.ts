import type { SiteLocale } from '@lib/datocms/types';

export const missingSlug = '-';
export type MaybeSlug = string | undefined;

type LocalizedSlugs = {
  _allSlugLocales?:
    | {
        locale?: SiteLocale | null;
        value?: string;
      }[]
    | null;
};

export function getLocalizedSlug<T extends LocalizedSlugs>({
  locale,
  record,
}: {
  locale?: SiteLocale;
  record: T;
}) {
  return record._allSlugLocales?.find((slug) => slug.locale === locale)?.value || missingSlug;
}

/**
 * Returns the slug from a URL path.
 *
 * Returns page-1 in the following examples:
 * - /page-1
 * - /page-1/
 * - /page-1/?foo=bar
 * - /grand-parent/parent-slug/page-1
 */
export const getSlugFromPath = (path: URL['pathname']) => {
  const url = new URL(path, 'https://www.example.com');
  const slug = url.pathname.split('/').filter(Boolean).pop();
  return slug;
};
