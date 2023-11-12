import type { 
  TableBlockFragment,
  TextBlockFragment,
  VideoEmbedBlockFragment,
} from '../lib/types/datocms';

export type AnyBlock = 
  | TableBlockFragment
  | TextBlockFragment
  | VideoEmbedBlockFragment;
