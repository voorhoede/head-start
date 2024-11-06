import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { JSDOM } from 'jsdom';
import { renderToString, renderToFragment } from '@lib/renderer';

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: vi.fn(),
  },
}));

vi.mock('jsdom', async () => {
  const actual = await vi.importActual<typeof import('jsdom')>('jsdom');

  return {
    ...actual,
    JSDOM: {
      ...actual.JSDOM,
      fragment: vi.fn(),
    },
  };
});

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

type RenderOptions = {
  props?: Props;
}

const mockComponent = vi.fn().mockImplementation((props: Props) => {
  return `<div>Test Content with ${JSON.stringify({ props })}</div>`;
});

const mockRenderResult = (props: Props) => `<div>Test Content with ${JSON.stringify(props)}</div>`;

const mockContainer = {
  renderToString: vi.fn().mockImplementation((_component: typeof mockComponent, options: RenderOptions) => {
    return Promise.resolve(mockRenderResult(options?.props || {}));
  }),
};

beforeAll(async () => {
  const { JSDOM: actualJSDOM } = await vi.importActual<typeof import('jsdom')>('jsdom');
  const dom = new actualJSDOM('<!DOCTYPE html><html><body></body></html>');
  vi.stubGlobal('document', dom.window.document);
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(JSDOM.fragment).mockReturnValue(document.createDocumentFragment());

  (AstroContainer.create as vi.Mock).mockResolvedValue(mockContainer);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('Renderer:', () => {
  describe('renderToString:', () => {
    test('should create an Astro container', async () => {
      await renderToString(mockComponent);
      expect(AstroContainer.create).toHaveBeenCalled();
    });

    test('should return the rendered string', async () => {
      const options = { props: { test: 'someProp' } };

      const resultWithProps = await renderToString(mockComponent, options);
      expect(resultWithProps).toBe('<div>Test Content with {"test":"someProp"}</div>');

      const resultWithoutProps = await renderToString(mockComponent);
      expect(resultWithoutProps).toBe('<div>Test Content with {}</div>');
    });
  });

  describe('renderToFragment:', () => {
    test('should create an Astro container', async () => {
      await renderToFragment(mockComponent);
      expect(AstroContainer.create).toHaveBeenCalled();
    });

    test('should return a document fragment from the rendered string', async () => {
      const mockFragment = document.createDocumentFragment();
      vi.mocked(JSDOM.fragment).mockReturnValue(mockFragment);

      const options = { props: { test: 'someProp' } };
      const resultWithProps = await renderToFragment(mockComponent, options);
      expect(JSDOM.fragment).toHaveBeenCalledWith('<div>Test Content with {"test":"someProp"}</div>');
      expect(resultWithProps).toBe(mockFragment);

      const resultWithoutProps = await renderToFragment(mockComponent);
      expect(JSDOM.fragment).toHaveBeenCalledWith('<div>Test Content with {}</div>');
      expect(resultWithoutProps).toBe(mockFragment);
    });

  });
});
