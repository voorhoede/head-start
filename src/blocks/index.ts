import type { AnyBlock } from './Blocks';
import { renderToString } from '@lib/renderer';
import Blocks from './Blocks.astro';

export const renderBlocks = async (blocks: AnyBlock[]) => {
  return await renderToString(Blocks, { props: { blocks } });
};
