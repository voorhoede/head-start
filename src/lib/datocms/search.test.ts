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
import type { SiteLocale } from '@lib/datocms/types';
import { datocmsSearch, formatSearchResults, type RawSearchResult } from './search';

vi.mock('@root/datocms-environment', () => ({
  datocmsBuildTriggerId: 'mock-build-trigger-id',
  datocmsEnvironment: 'mock-environment',
}));

const mockedSearchResults = [
  {
    type: 'search_result',
    id: '1',
    attributes: {
      title: 'Test Title',
      body_excerpt: 'This is a test body excerpt.',
      url: 'https://example.com',
      score: 1,
      highlight: {
        title: ['[h]Test[/h] Title'],
        body: ['This is a [h]test[/h] body excerpt.'],
      },
    },
  },

] satisfies RawSearchResult[];

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
    expect(response.results[0].matches[0].markedText).toBe('This is a <mark>test</mark> body excerpt.');
    expect(response.meta.total_count).toBe(1);
  });
});

describe('formatSearchResults:', () => {
  test('should format search results with highlights', () => {
    const query = 'Test';
    const results = mockedSearchResults;

    const formattedResults = formatSearchResults({ query, results });

    expect(formattedResults).toHaveLength(1);
    expect(formattedResults[0].title).toBe('Test Title');
    expect(formattedResults[0].matches[0].markedText).toBe('This is a <mark>test</mark> body excerpt.');
    expect(formattedResults[0].textFragmentUrl).toBe('https://example.com#:~:text=test');
  });

  test('should handle results without highlights', () => {
    const query = 'Test';
    const results: RawSearchResult[] = [
      {
        type: 'search_result',
        id: '2',
        attributes: {
          title: 'Another Title',
          body_excerpt: 'No highlights here.',
          url: 'https://example.com/2',
          score: 0.5,
          highlight: {
            title: null,
            body: null,
          },
        },
      },
    ];

    const formattedResults = formatSearchResults({ query, results });

    expect(formattedResults).toHaveLength(1);
    expect(formattedResults[0].title).toBe('Another Title');
    expect(formattedResults[0].matches[0].markedText).toBe('No highlights here.');
    expect(formattedResults[0].textFragmentUrl).toBe('https://example.com/2#:~:');
  });
});
