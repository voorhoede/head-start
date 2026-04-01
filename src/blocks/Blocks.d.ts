import type {
  ActionBlockFragment,
  EmbedBlockFragment,
  ImageBlockFragment,
  PagePartialBlockFragment,
  TableBlockFragment,
  TextBlockFragment,
  TextImageBlockFragment,
  VideoBlockFragment,
  VideoEmbedBlockFragment,
  GroupingBlockFragment,
  CounterBlockFragment,
  ListBlockFragment,
  IconBlockFragment,
} from '@lib/datocms/types';

export type AnyBlock = Omit<
  ( // Add any new Block types here.
    | ActionBlockFragment
    | EmbedBlockFragment
    | GroupingBlockFragment
    | ImageBlockFragment
    | PagePartialBlockFragment
    | TableBlockFragment
    | TextBlockFragment
    | TextImageBlockFragment
    | VideoBlockFragment
    | VideoEmbedBlockFragment
    | CounterBlockFragment
    | ListBlockFragment
    | IconBlockFragment
  ), '__typename' // Allow for any __typename so that missing blocks can be reported on.
> & { __typename: string };
