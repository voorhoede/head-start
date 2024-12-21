import { experimental_AstroContainer as AstroContainer, type ContainerRenderOptions } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { AnyBlock } from './Blocks';
import Blocks from './Blocks.astro';

export async function renderToString<Props>(
  component: AstroComponentFactory,
  options?: ContainerRenderOptions & { props?: Props }
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(component, options);
}

export const renderBlocks = async (blocks: AnyBlock[]) => {
  return await renderToString(Blocks, { props: { blocks } });
};
