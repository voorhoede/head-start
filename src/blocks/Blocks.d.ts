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
  | VideoEmbedBlockFragment;
