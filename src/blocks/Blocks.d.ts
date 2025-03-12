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
} from '@lib/datocms/types';

export type AnyBlock =
  | ActionBlockFragment
  | EmbedBlockFragment
  | ImageBlockFragment
  | PagePartialBlockFragment
  | TableBlockFragment
  | TextBlockFragment
  | TextImageBlockFragment
  | VideoBlockFragment
  | VideoEmbedBlockFragment
  | GroupingBlockFragment;
