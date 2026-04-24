import ActionBlock from './ActionBlock/ActionBlock.astro';
import CounterBlock from './CounterBlock/CounterBlock.astro';
import EmbedBlock from './EmbedBlock/EmbedBlock.astro';
import GroupingBlock from './GroupingBlock/GroupingBlock.astro';
import IconBlock from './IconBlock/IconBlock.astro';
import ImageBlock from './ImageBlock/ImageBlock.astro';
import ListBlock from './ListBlock/ListBlock.astro';
import PagePartialBlock from './PagePartialBlock/PagePartialBlock.astro';
import TableBlock from './TableBlock/TableBlock.astro';
import TextBlock from './TextBlock/TextBlock.astro';
import TextImageBlock from './TextImageBlock/TextImageBlock.astro';
import VariableBlock from './VariableBlock/VariableBlock.astro';
import VideoBlock from './VideoBlock/VideoBlock.astro';
import VideoEmbedBlock from './VideoEmbedBlock/VideoEmbedBlock.astro';

export const blocksByTypename = {
  ActionBlockRecord: ActionBlock,
  CounterBlockRecord: CounterBlock,
  EmbedBlockRecord: EmbedBlock,
  GroupingBlockRecord: GroupingBlock,
  IconBlockRecord: IconBlock,
  ImageBlockRecord: ImageBlock,
  ListBlockRecord: ListBlock,
  PagePartialBlockRecord: PagePartialBlock,
  TableBlockRecord: TableBlock,
  TextBlockRecord: TextBlock,
  TextImageBlockRecord: TextImageBlock,
  VariableBlockRecord: VariableBlock,
  VideoBlockRecord: VideoBlock,
  VideoEmbedBlockRecord: VideoEmbedBlock,
};
