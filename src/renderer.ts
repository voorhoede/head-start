import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PageNotFoundTemplate from '@pages/[locale]/404.astro';

export const renderPageNotFound = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(PageNotFoundTemplate, { params: { locale: 'en' } });
};
