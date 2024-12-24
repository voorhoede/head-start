import { datocmsCollection } from '@lib/datocms';
import { type PageRouteForPath, getPagePath } from '@lib/routing/page';

export async function getStaticPaths() {
  const pages = await datocmsCollection<PageRouteForPath>({
    collection: 'Pages',
    fragment: `
      _allSlugLocales { locale, value }
      parentPage {
        _allSlugLocales { locale, value }
        parentPage {
          _allSlugLocales { locale, value }
          parentPage {
            _allSlugLocales { locale, value }
            parentPage {
              _allSlugLocales { locale, value }
            }
          }
        }
      }
    `,
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
