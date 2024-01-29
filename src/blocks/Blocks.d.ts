import { 
  EmbedBlockFragment,
  ImageBlockFragment,
  PagePartialBlockFragment,
  TableBlockFragment,
  TextBlockFragment,
  TextImageBlockFragment,
  VideoBlockFragment,
  VideoEmbedBlockFragment,
} from '@lib/types/datocms';

export type AnyBlock =
  | EmbedBlockFragment
  | ImageBlockFragment
  | PagePartialBlockFragment
  | TableBlockFragment
  | TextBlockFragment
  | TextImageBlockFragment
  | VideoBlockFragment
  | VideoEmbedBlockFragment;
