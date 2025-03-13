import { defineCollection, z } from 'astro:content';
import { PageRoute as fragment, type PageRouteFragment } from '@lib/datocms/types';
import { datocmsCollection } from '@lib/datocms';
import { mapSlugsToIds, type Mapped } from './lib/slug';

const name = 'Pages' as const;

const loader = () => datocmsCollection<PageRouteFragment>({
  collection: name,
  fragment,
}).then(mapSlugsToIds);

const collection = defineCollection({
  loader: loader,
  schema: z.custom<Mapped<PageRouteFragment>>(),
});

export default {
  [name]: {
    name,
    collection,
    loader,
  }
};
