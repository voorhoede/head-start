// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('~/lib/i18n', () => ({
  getLocale: () => 'en',
  t: (key: string) => key,
  locales: ['en', 'nl'],
  defaultLocale: 'en',
  isLocale: (locale: unknown) => ['en', 'nl'].includes(locale as string),
  setLocale: vi.fn(),
  cookieName: 'HEAD_START_LOCALE',
}));

vi.mock('~/lib/search', () => ({
  queryParamName: 'query',
  minQueryLength: 3,
  hasValidQuery: (q: string) => q.length >= 3,
  getSearchPathname: () => '/en/search/',
}));

import './SearchFormBlock.client';

describe('SearchFormBlock client', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  function appendBlock(inputValue: string): HTMLInputElement {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<search-form-block><input type="search" value="${inputValue}" /></search-form-block>`;
    document.body.appendChild(wrapper.firstElementChild!);
    return document.body.lastElementChild!.querySelector('input[type="search"]') as HTMLInputElement;
  }

  test('keeps DatoCMS content when input already has a value', () => {
    vi.stubGlobal('location', { pathname: '/en/some-page', search: '?query=url-query' });
    expect(appendBlock('dato query').value).toBe('dato query');
  });

  test('uses URL query param when there is no DatoCMS content', () => {
    vi.stubGlobal('location', { pathname: '/en/some-page', search: '?query=url+query' });
    expect(appendBlock('').value).toBe('url query');
  });

  test('uses prettified pathname when there is no content and no URL query', () => {
    vi.stubGlobal('location', { pathname: '/en/some-page', search: '' });
    expect(appendBlock('').value).toBe('some page');
  });

  describe('priority order: DatoCMS content > URL query param > URL path', () => {
    test('DatoCMS content wins over URL query and path', () => {
      vi.stubGlobal('location', { pathname: '/en/some-page', search: '?query=url-query' });
      expect(appendBlock('dato query').value).toBe('dato query');
    });

    test('URL query wins over path when there is no DatoCMS content', () => {
      vi.stubGlobal('location', { pathname: '/en/some-page', search: '?query=url-query' });
      expect(appendBlock('').value).toBe('url-query');
    });

    test('path is used as last resort when there is no DatoCMS content and no URL query', () => {
      vi.stubGlobal('location', { pathname: '/en/some-page', search: '' });
      expect(appendBlock('').value).toBe('some page');
    });
  });
});
