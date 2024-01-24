import { 
  EmbedBlockFragment,
  ImageBlockFragment,
  PagePartialBlockFragment,
  TableBlockFragment,
  TextBlockFragment,
  TextImageBlockFragment,
  VideoEmbedBlockFragment,
} from '@lib/types/datocms';

export type AnyBlock =
  | EmbedBlockFragment
  | ImageBlockFragment
  | PagePartialBlockFragment
  | TableBlockFragment
  | TextBlockFragment
  | TextImageBlockFragment
  | VideoEmbedBlockFragment;

export type BlockContext = {
  location?: 'header' | 'body' | 'footer';
  index: number;
}
