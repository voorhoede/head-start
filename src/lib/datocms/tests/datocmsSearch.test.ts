import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { datocmsSearch } from '@lib/datocms';
import type { SiteLocale } from '@lib/datocms/types.ts';

vi.mock('../../../../datocms-environment', () => ({
  datocmsBuildTriggerId: 'mock-build-trigger-id',
  datocmsEnvironment: 'mock-environment',
}));

const mockedSearchResults = [
  {
    type: 'search_result',
    id: '1',
    attributes: {
      title: 'Test Title',
      body_excerpt: 'Test body',
      url: 'https://example.com',
      score: 1,
      highlight: {
        title: ['Test [h]Title[/h]'],
        body: ['Test [h]body[/h]'],
      },
    },
  }
];

const mockLocales = ['en', 'nl'] as SiteLocale[];

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

afterAll(() => server.close());

describe('datocmsSearch:', () => {
  test('should return results from datocmsSearch', async () => {
    server.use(
      http.get('https://site-api.datocms.com/search-results', () => {
        return HttpResponse.json({
          data: mockedSearchResults,
          meta: { total_count: 1 },
        });
      })
    );

    const response = await datocmsSearch({ locale: 'en', query: 'test' });

    expect(response.results).toHaveLength(1);
    expect(response.results[0].title).toBe('Test Title');
    expect(response.meta.total_count).toBe(1);
  });

  test('should return an empty array if no results are found', async () => {
    server.use(
      http.get('https://site-api.datocms.com/search-results', () => {
        return HttpResponse.json({
          data: [],
          meta: { total_count: 0 },
        });
      })
    );

    const response = await datocmsSearch({ locale: 'en', query: 'non-existent' });

    expect(response.results).toEqual([]);
    expect(response.meta.total_count).toBe(0);
  });

  test('should set correct search parameters', async () => {
    let requestUrl: URL | undefined;

    server.use(
      http.get('https://site-api.datocms.com/search-results', ({ request }) => {
        requestUrl = new URL(request.url);
        return HttpResponse.json({
          data: [],
          meta: { total_count: 0 }
        });
      })
    );

    for (const locale of mockLocales) {
      await datocmsSearch({ locale, query: 'test' });
      expect(requestUrl).toBeDefined();
      expect(requestUrl!.searchParams.get('locale')).toBe(locale);
      expect(requestUrl!.searchParams.get('q')).toBe('test');
      expect(requestUrl!.searchParams.get('build_trigger_id')).toBe('mock-build-trigger-id');
    }
  });

  test('should handle fuzzy search correctly', async () => {
    let requestUrl: URL | undefined;

    server.use(
      http.get('https://site-api.datocms.com/search-results', ({ request }) => {
        requestUrl = new URL(request.url);
        return HttpResponse.json({
          data: [],
          meta: { total_count: 0 }
        });
      })
    );

    await datocmsSearch({ locale: 'en', query: 'test' });
    expect(requestUrl).toBeDefined();
    expect(requestUrl!.searchParams.get('fuzzy')).toBe('true');

    await datocmsSearch({ locale: 'en', query: 'test', fuzzy: true });
    expect(requestUrl).toBeDefined();
    expect(requestUrl!.searchParams.get('fuzzy')).toBe('true');

    await datocmsSearch({ locale: 'en', query: 'test', fuzzy: false });
    expect(requestUrl).toBeDefined();
    expect(requestUrl!.searchParams.has('fuzzy')).toBe(false);
  });

  test('should handle API errors correctly', async () => {
    server.use(
      http.get('https://site-api.datocms.com/search-results', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    let response: Error;

    try {
      await datocmsSearch({ locale: 'en', query: 'test' });
    } catch (error: unknown) {
      response = error as Error;
    }

    expect(response!).toBeInstanceOf(Error);
    expect(response!.message).toBe('DatoCMS search API returned 500 Internal Server Error');
  });

  test('should correctly format search results', async () => {
    server.use(
      http.get('https://site-api.datocms.com/search-results', () => {
        return HttpResponse.json({
          data: mockedSearchResults,
          meta: { total_count: 1 },
        });
      })
    );

    const response = await datocmsSearch({ locale: 'en', query: 'test' });

    expect(response.results[0].title).toBe('Test Title');
    expect(response.results[0].matches[0].markedText).toBe('Test <mark>body</mark>');
    expect(response.meta.total_count).toBe(1);
  });
});
