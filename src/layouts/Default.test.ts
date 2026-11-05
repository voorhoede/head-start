import { describe, expect, test, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Default from './Default.astro';

vi.mock('~/lib/app', () => ({
  getApp: () => Promise.resolve({ noIndex: false, allowAiBots: true }),
}));

vi.mock('~/lib/datocms', async (importOriginal) => {
  const page = (id: string, title: string, slug: string) => ({
    __typename: 'PageRecord',
    id,
    title,
    slug,
    _allSlugLocales: [{ locale: 'en', value: slug }],
    parentPage: null,
  });
  return {
    ...(await importOriginal<typeof import('~/lib/datocms')>()),
    datocmsRequest: () => Promise.resolve({
      seo: { faviconMetaTags: [] },
      app: {
        openPageInLlmPrompt: 'Explain { pageUrl }',
        openPageInLlmOption: [],
        menuItems: [
          { __typename: 'MenuItemInternalRecord', id: 'about', internalTitle: null, internalLink: page('p1', 'About', 'about'), items: [] },
          {
            __typename: 'MenuItemGroupRecord',
            id: 'topics',
            title: 'Topics',
            items: [
              { __typename: 'MenuItemInternalRecord', id: 'topic', internalTitle: 'Topic', internalLink: page('p2', 'Topic one', 'topic-one') },
            ],
          },
          { __typename: 'MenuItemExternalRecord', id: 'elsewhere', title: 'Elsewhere', link: 'https://example.org/', items: [] },
        ],
      },
    }),
  };
});

const cfContext: App.Locals['cfContext'] = {
  waitUntil: () => {},
  passThroughOnException: () => {},
  props: {},
};

const previewLocals: App.Locals = {
  cfContext,
  isPreview: true,
  isPreviewAuthOk: true,
  editModeOn: true,
  datocmsEnvironment: 'test',
  datocmsToken: 'test',
  previewSecret: 'test',
};
// The Open in LLM controls only render outside preview mode.
const productionLocals: App.Locals = { ...previewLocals, isPreview: false, isPreviewAuthOk: false };

const render = async (locals: App.Locals) => (await AstroContainer.create({ astroConfig: { site: 'https://example.com' } })).renderToString(Default, {
  params: { locale: 'en' },
  props: { pageUrls: [{ locale: 'en', pathname: '/en/' }], seoMetaTags: [] },
  locals,
});

describe('Default layout', () => {
  // Preview mode reloads once the rendered page differs from the page on screen,
  // which only works if unchanged content renders the same every time.
  test.each([
    ['in preview mode', previewLocals],
    ['outside preview mode', productionLocals],
  ])('renders the same HTML for the same content on every request %s', async (_name, locals) => {
    const first = await render(locals);
    const second = await render(locals);
    expect(second).toBe(first);
  });

  test('renders the menu items and the Open in LLM controls, so the comparison covers them', async () => {
    const html = await render(productionLocals);
    expect(html).toContain('About');
    expect(html).toContain('/en/topic-one/');
    expect(html).toContain('https://example.org/');
    expect(html).toContain('data-nosnippet');
  });
});
