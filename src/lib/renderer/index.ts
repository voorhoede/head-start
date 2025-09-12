import { type ContainerRenderOptions, experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { JSDOM } from 'jsdom';

export async function renderToString<Props>(
  component: AstroComponentFactory,
  options?: ContainerRenderOptions & { props?: Props }
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(component, options);
}

export async function renderToFragment<Props>(
  component: AstroComponentFactory,
  options?: ContainerRenderOptions & { props?: Props }
): Promise<DocumentFragment> {
  const container = await AstroContainer.create();
  const result = await container.renderToString(component, options);
  return JSDOM.fragment(result);
}

export async function renderToResponse<Props>(
  component: AstroComponentFactory,
  options?: ContainerRenderOptions & { props?: Props }
): Promise<Response> {
  const container = await AstroContainer.create();
  return await container.renderToResponse(component, options);
}
