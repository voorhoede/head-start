import { describe, expect, test, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Default from './Default.astro';

vi.mock('~/lib/app', () => ({
  getApp: () => Promise.resolve({ noIndex: false, allowAiBots: false }),
}));

vi.mock('~/lib/datocms', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/lib/datocms')>()),
  datocmsRequest: () => Promise.resolve({
    seo: { faviconMetaTags: [] },
    app: {
      openPageInLlmPrompt: '',
      openPageInLlmOption: [],
      menuItems: [
        { __typename: 'MenuItemExternalRecord', id: 'elsewhere', title: 'Elsewhere', link: 'https://example.org/', items: [] },
      ],
    },
  }),
}));

const locals: App.Locals = {
  cfContext: { waitUntil: () => {}, passThroughOnException: () => {}, props: {} },
  isPreview: true,
  isPreviewAuthOk: true,
  editModeOn: true,
  datocmsEnvironment: 'test',
  datocmsToken: 'test',
  previewSecret: 'test',
};

const render = async () => (await AstroContainer.create({ astroConfig: { site: 'https://example.com' } })).renderToString(Default, {
  params: { locale: 'en' },
  props: { pageUrls: [{ locale: 'en', pathname: '/en/' }], seoMetaTags: [] },
  locals,
});

describe('Default layout', () => {
  // Preview mode reloads once the rendered page differs from the page on screen,
  // which only works if unchanged content renders the same every time.
  test('renders the same HTML for the same content on every request in preview mode', async () => {
    const first = await render();
    const second = await render();
    expect(second).toBe(first);
  });
});
