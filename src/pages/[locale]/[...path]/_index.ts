import { datocmsCollection } from '@lib/datocms';
import { getPagePath } from '@lib/routing/page';
import { PageRoute as fragment, type PageRouteFragment } from '@lib/datocms/types';

export async function getStaticPaths() {
  const pages = await datocmsCollection<PageRouteFragment>({
    collection: 'Pages',
    fragment,
  });
  return pages.flatMap((page) => {
    const locales = page._allSlugLocales
      ?.map((slug) => slug.locale)
      .filter((locale) => !!locale);
    return locales?.map((locale) => {
      return { params: { locale, path: getPagePath({ page, locale }) } };
    });
  });
}
