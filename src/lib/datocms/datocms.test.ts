import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { http, HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { parse } from 'graphql/language';
import {
  datocmsCollection,
  datocmsRequest,
  datocmsSearch,
  formatSearchResults,
  type RawSearchResult,
} from './index';

vi.mock('../../../datocms-environment', () => ({
  datocmsBuildTriggerId: 'mock-build-trigger-id',
  datocmsEnvironment: 'mock-environment',
}));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

afterAll(() => server.close());

describe('datocms:', () => {
  describe('datocmsRequest:', () => {
    test('should successfully fetch data', async () => {
      const mockData = [
        {
          id: 1,
          title: 'Hello World',
          body: 'It\'s a beautiful day today.',
        },
      ];

      server.use(
        graphql.query('MockQuery', () => {
          return HttpResponse.json({ data: { mockData } });
        }),
      );

      const response = await datocmsRequest({
        query: parse('query MockQuery { id }')
      });
      expect(response).toEqual({ mockData });
    });

    test('should return an empty array if no record is found', async () => {
      const mockData: [] = [];

      server.use(
        graphql.query('MockQuery', () => {
          return HttpResponse.json({ data: mockData });
        }),
      );

      const response = await datocmsRequest({
        query: parse('query MockQuery { id }')
      });
      expect(response).toEqual([]);
    });

    test('should throw an error if the response contains GraphQL errors', async () => {
      const errorResponse = [{ message: 'Something went wrong' }];

      server.use(
        graphql.query('MockQuery', () => {
          return HttpResponse.json(
            { errors: errorResponse },
            { status: 200 }
          );
        }),
      );

      let response: Error;

      try {
        await datocmsRequest({
          query: parse('query MockQuery { id }')
        });
      } catch (error: unknown) {
        response = error as Error;
      }

      expect(response!).toBeInstanceOf(Error);

      // compare parsed objects instead of stringified objects because the formatting of the error message strings is an implementation detail
      // e.g. JSON.stringify({ a: 'b' }, null, 2) does not equal JSON.stringify({ a: 'b' }, null, 4) because of the difference in whitespace
      const parsedErrorResponse = JSON.parse(response!.message);
      expect(parsedErrorResponse).toEqual(errorResponse);
    });

    test('should retry if it hits a rate-limit error', async () => {
      const mockData = [
        {
          id: 1,
          title: 'Hello World',
          body: 'It\'s a beautiful day today.',
        },
      ];
      let numberOfAttempts = 0;

      server.use(
        graphql.query('MockQuery', () => {
          numberOfAttempts++;

          if (numberOfAttempts === 1) {
            return HttpResponse.json(
              { errors: [{ message: 'Rate limit exceeded' }] },
              { status: 429, headers: { 'X-RateLimit-Reset': '1' } }
            );
          }

          return HttpResponse.json({ data: { mockData } });
        }),
      );

      const response = await datocmsRequest({
        query: parse('query MockQuery { id }')
      });
      expect(numberOfAttempts).toBe(2);
      expect(response).toEqual({ mockData });
    });

    test('should include headers that ask for drafts in response when HEAD_START_PREVIEW is truthy', async () => {
      const mockData = [
        {
          id: 1,
          title: 'Hello World',
          body: 'It\'s a beautiful day today.',
        },
      ];
      let requestHeaders: Record<string, string> = {};

      server.use(
        graphql.query('MockQuery', ({ request }) => {
          requestHeaders = Object.fromEntries(request.headers);

          return HttpResponse.json({ data: { mockData } });
        }),
      );

      // we check if the 'x-include-drafts' header is set, but in datocms/index.ts we set conditionally append the 'X-Include-Drafts' header
      // note the difference in casing -- HTTP headers are case-insensitive and are often normalized to lowercase when processed
      // this is why we check for 'x-include-drafts' instead of 'X-Include-Drafts'

      // 'true' instead of true because subEnv expects a string
      vi.stubEnv('HEAD_START_PREVIEW', 'true');
      await datocmsRequest({
        query: parse('query MockQuery { id }')
      });
      expect(requestHeaders['x-include-drafts']).toBe('true');

      // empty string because subEnv expects a string, but the value should be falsy
      vi.stubEnv('HEAD_START_PREVIEW', '');
      await datocmsRequest({
        query: parse('query MockQuery { id }')
      });
      expect(requestHeaders['x-include-drafts']).toBeUndefined();
    });
  });

  describe('datocmsCollection:', () => {
    test('should successfully fetch a non-paginated collection', async () => {
      const totalRecords = 50;
      const mockCollection = Array.from({ length: totalRecords }, (_, i) => ({
        id: i + 1,
        title: `Record ${i + 1}`
      }));

      server.use(
        graphql.query('MyMockCollectionMeta', () => {
          return HttpResponse.json({
            data: {
              meta: {
                count: totalRecords,
              },
            },
          });
        }),
      );

      server.use(
        graphql.query('AllMyMockCollection', () => {
          return HttpResponse.json({ data: { MyMockCollection: mockCollection } });
        }),
      );

      const records = await datocmsCollection({ collection: 'MyMockCollection', fragment: 'id title' });
      expect(records).toHaveLength(totalRecords);
      expect(records).toEqual(mockCollection);
    });

    test('should successfully fetch all records from a paginated collection', async () => {
      // datoCMS GraphQL API has a limit of 100 records per request
      const recordsPerRequest = 100;
      const totalRecords = 150;
      const mockCollection = Array.from({ length: totalRecords }, (_, i) => ({
        id: i + 1,
        title: `Record ${i + 1}`
      }));
      let requestCount = 0;

      server.use(
        graphql.query('MyMockCollectionMeta', () => {
          return HttpResponse.json({
            data: {
              meta: {
                count: totalRecords,
              },
            },
          });
        }),
      );

      server.use(
        graphql.query('AllMyMockCollection', () => {
          const skip = requestCount * 100;
          const paginatedData = mockCollection.slice(skip, skip + recordsPerRequest);

          requestCount++;
          return HttpResponse.json({ data: { MyMockCollection: paginatedData } });
        }),
      );

      const records = await datocmsCollection({ collection: 'MyMockCollection', fragment: 'id title' });
      expect(records).toHaveLength(totalRecords);
      expect(records).toEqual(mockCollection);

      // should be 2 (requests) for 150 records with 100 per call
      const totalPages = Math.ceil(totalRecords / recordsPerRequest);
      expect(requestCount).toBe(totalPages);
    });

    test('should return an empty array if no records are found', async () => {
      server.use(
        graphql.query('MyMockCollectionMeta', () => {
          return HttpResponse.json({
            data: {
              meta: {
                count: 0,
              },
            },
          });
        }),
      );

      server.use(
        graphql.query('AllMyMockCollection', () => {
          return HttpResponse.json({ data: { MyMockCollection: [] } });
        }),
      );

      const records = await datocmsCollection({ collection: 'MyMockCollection', fragment: 'id title' });
      expect(records).toEqual([]);
    });

    test('should throw an error if the response contains GraphQL errors', async () => {
      const errorResponse = [{ message: 'Something went wrong' }];

      server.use(
        graphql.query('MyMockCollectionMeta', () => {
          return HttpResponse.json({
            data: {
              meta: {
                count: 1,
              },
            },
          });
        }),
      );

      server.use(
        graphql.query('AllMyMockCollection', () => {
          return HttpResponse.json(
            { errors: errorResponse },
            { status: 200 }
          );
        }),
      );

      let response: Error;

      try {
        await datocmsCollection({ collection: 'MyMockCollection', fragment: 'id title' });
      } catch (error: unknown) {
        response = error as Error;
      }

      expect(response!).toBeInstanceOf(Error);

      // compare parsed objects instead of stringified objects because the formatting of the error message strings is an implementation detail
      // e.g. JSON.stringify({ a: 'b' }, null, 2) does not equal JSON.stringify({ a: 'b' }, null, 4) because of the difference in whitespace
      const parsedErrorResponse = JSON.parse(response!.message);
      expect(parsedErrorResponse).toEqual(errorResponse);
    });
  });

  describe('formatSearchResults:', () => {
    test('should format search results with highlights', () => {
      const query = 'Test';
      const results: RawSearchResult[] = [
        {
          type: 'search_result',
          id: '1',
          attributes: {
            title: 'Test Title',
            body_excerpt: 'This is a test body excerpt.',
            url: 'https://example.com',
            score: 1,
            highlight: {
              title: ['Test [h]Title[/h]'],
              body: ['This is a [h]test[/h] body excerpt.'],
            },
          },
        },
      ];

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

  describe('datocmsSearch:', () => {
    test('should return results from datocmsSearch', async () => {
      server.use(
        http.get('https://site-api.datocms.com/search-results', () => {
          return HttpResponse.json({
            data: [
              {
                type: 'search_result',
                id: '1',
                attributes: {
                  title: 'Test Title',
                  body_excerpt: 'Test body',
                  url: 'https://test.com',
                  score: 1,
                  highlight: {
                    title: ['Test [h]Title[/h]'],
                    body: ['Test [h]body[/h]'],
                  },
                },
              },
            ],
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
      let requestUrl: URL;

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

      expect(requestUrl.searchParams.get('locale')).toBe('en');
      expect(requestUrl.searchParams.get('q')).toBe('test');
      expect(requestUrl.searchParams.get('build_trigger_id')).toBe('mock-build-trigger-id');

      await datocmsSearch({ locale: 'nl', query: 'my mock query' });

      expect(requestUrl.searchParams.get('locale')).toBe('nl');
      expect(requestUrl.searchParams.get('q')).toBe('my mock query');
      expect(requestUrl.searchParams.get('build_trigger_id')).toBe('mock-build-trigger-id');
    });

    test('should handle fuzzy search correctly', async () => {
      let requestUrl: URL;

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
      expect(requestUrl.searchParams.get('fuzzy')).toBe('true');

      await datocmsSearch({ locale: 'en', query: 'test', fuzzy: true });
      expect(requestUrl.searchParams.get('fuzzy')).toBe('true');

      await datocmsSearch({ locale: 'en', query: 'test', fuzzy: false });
      expect(requestUrl.searchParams.has('fuzzy')).toBe(false);
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
            data: [
              {
                type: 'search_result',
                id: '1',
                attributes: {
                  title: 'Test Title',
                  body_excerpt: 'Test body',
                  url: 'https://test.com',
                  score: 1,
                  highlight: {
                    title: ['Test [h]Title[/h]'],
                    body: ['Test [h]body[/h]'],
                  },
                },
              },
            ],
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
});
