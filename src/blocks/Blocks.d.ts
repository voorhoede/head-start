import { ImageBlockFragment, TableBlockFragment, TextBlockFragment, VideoEmbedBlockFragment } from '@lib/types/datocms';

export type AnyBlock =
  | ImageBlockFragment
  | TableBlockFragment
  | TextBlockFragment
  | VideoEmbedBlockFragment;
