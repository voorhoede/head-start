import type { SiteLocale } from '@lib/datocms/types';
import { getLocalizedSlug, type LocalizedSlugs } from '@lib/routing/lib/slug';

const LOCALE_SEPARATOR = '/';

type Record = { 
  id: string; 
  slug?: string | null;
} & LocalizedSlugs;

export type Mapped<T extends Record = Record> = T & {
  _id?: T['id'] 
  locale?: SiteLocale | null;
};

/**
 * Transforms an array of entries to use (localized) slugs as item ids.
 * @param entries - Array of entries to transform
 * @returns Transformed array with ids as `[slug]` or `[locale]/[slug]` if localized
 */
export function mapSlugsToIds<T extends Record>(entries: T[]) {
  return entries.reduce<(Mapped<T>)[]>((acc, entry) => ([
    ...acc,
    ...(entry?._allSlugLocales?.length) 
      ? mapLocalizedSlugs(entry)
      : [mapSlug(entry)]
  ]), []);
}

function mapSlug<T extends Record>(entry: T): Mapped<T> {
  const mapped = (entry.slug) 
    ? {
      _id: entry.id,
      id: entry.slug
    } satisfies Mapped<Record> 
    : {};
  
  return { ...entry, ...mapped };
}

function mapLocalizedSlugs<T extends Record>(entry: T) {
  return (entry._allSlugLocales || [])
    .filter(({ locale }) => Boolean(locale))
    .map(({ locale }) => {
      const mapped = {
        _id: entry.id,
        locale: locale,
        id: locale
          ? combine(getLocalizedSlug({ record: entry, locale: locale }), locale)
          : ''
      } satisfies Mapped<Record>;
      
      return { ...entry, ...mapped };
    });
}

export const combine = (slug: string, locale?: string | null) => locale 
  ? `${slug}${LOCALE_SEPARATOR}${locale}`
  : slug;

export const split = (id: string) => {
  const [ slug, locale ] = id.split(LOCALE_SEPARATOR);
  return { slug, locale };
};
