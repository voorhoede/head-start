import { defineCollection, z } from 'astro:content';
import { datocmsCollection } from '@lib/datocms';
import { locales } from '@lib/i18n';
import { getPageHref } from '@lib/routing';

type PagesCollectionRecord = {
  id: string;
  slug: string;
  title: string;
}

type PagesCollectionEntry = PagesCollectionRecord & {
  _meta: {
    locale: string;
    id: string;
    href: string;
  };
}

const fragment = `
  id
  slug
  title
  tags {
    id
    slug
    title
  }
  _firstPublishedAt
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
`;

export const collection = defineCollection({
  loader: async () => {
    const collections = await Promise.all(locales.map(async (locale) => {
      const collection = await datocmsCollection<PagesCollectionRecord>({
        locale,
        collection: 'Pages',
        filter: '{ title: { neq: null } }',
        fragment,
      });
      return collection.map(record => ({
        _meta: {
          locale,         // DatoCMS doesn't return the locale of the record, so we add it as meta data
          id: record.id,  // Keep reference of the original ID as we need to overwrite page.id below
          href: getPageHref({ locale, record }),
        },
        ...record,
        id: `${locale}/${record.id}`, // Astro overwrites entries with same ID, so prefixing locale
      }) satisfies PagesCollectionEntry);
    }));
    console.log('✅ Updated Pages Collection');
    return collections.flat();
  },

  // Only values defined in the schema will be available in the collection
  schema: z.object({
    _meta: z.object({
      locale: z.string(),
      id: z.string(),
      href: z.string(),
    }),
    _firstPublishedAt: z.string(),
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    tags: z.array(z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
    })),
  }),
});
