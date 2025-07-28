import type {
  ActionBlockFragment,
  EmbedBlockFragment,
  FormBlockFragment,
  ImageBlockFragment,
  PagePartialBlockFragment,
  TableBlockFragment,
  TextBlockFragment,
  TextImageBlockFragment,
  VideoBlockFragment,
  VideoEmbedBlockFragment,
  GroupingBlockFragment,
} from '@lib/datocms/types';

export type AnyBlock = Omit<
  ( // Add any new Block types here.
    | ActionBlockFragment
    | EmbedBlockFragment
    | FormBlockFragment
    | GroupingBlockFragment
    | ImageBlockFragment
    | PagePartialBlockFragment
    | TableBlockFragment
    | TextBlockFragment
    | TextImageBlockFragment
    | VideoBlockFragment
    | VideoEmbedBlockFragment
  ), '__typename' // Allow for any __typename so that missing blocks can be reported on.
> & { __typename: string };
