import { defineCollection, z } from 'astro:content';
import { PageRoute as fragment, type PageRouteFragment } from '@lib/datocms/types';
import { datocmsCollection } from '@lib/datocms';

const name = 'Pages' as const;

const loader = () => datocmsCollection<PageRouteFragment>({
  collection: name,
  fragment,
});

const collection = defineCollection({
  loader: loader,
  schema: z.custom<PageRouteFragment>(),
});

export default {
  [name]: {
    name,
    collection,
    loader,
  }
};
