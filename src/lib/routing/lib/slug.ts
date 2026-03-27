import type { SiteLocale } from '@lib/datocms/types';
import { defaultLocale, getFallbackLocales } from '@lib/i18n';

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

export type Slugs = LocalizedSlugs & { slug: string }

export function getRecordLocale<T extends Slugs>({
  locale,
  record: {
    slug,
    _allSlugLocales
  },
}: {
  locale: SiteLocale,
  record: T
}) {
  const slugLocales = _allSlugLocales?.filter(({ value }) => value === slug);

  const recordLocale = [
    locale,
    ...getFallbackLocales(locale)
  ].find(
    preferred => slugLocales?.some(({ locale }) => locale === preferred)
  ) || defaultLocale;
  return recordLocale;
}

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
