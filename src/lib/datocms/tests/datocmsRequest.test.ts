import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { parse } from 'graphql/language';
import { datocmsRequest } from '@lib/datocms';

// these imports will resolve to their mocked counterparts
import * as env from 'astro:env/server';

vi.mock('astro:env/server', async () => {
  const actual = await import('astro:env/server');

  return {
    ...actual,
    HEAD_START_PREVIEW: true,
  };
});

vi.mock('../../../../datocms-environment', () => ({
  datocmsBuildTriggerId: 'mock-build-trigger-id',
  datocmsEnvironment: 'mock-environment',
}));

const mockedSingleRecordCollection = [
  {
    id: 1,
    title: 'Hello World',
    body: 'It\'s a beautiful day today.',
  },
];

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

afterAll(() => server.close());

describe('datocmsRequest:', () => {
  test('should successfully fetch data', async () => {
    const mockData = mockedSingleRecordCollection;

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
    const mockData = mockedSingleRecordCollection;
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
    const mockData = mockedSingleRecordCollection;
    let requestHeaders: Record<string, string> = {};

    server.use(
      graphql.query('MockQuery', ({ request }) => {
        requestHeaders = Object.fromEntries(request.headers);

        return HttpResponse.json({ data: { mockData } });
      }),
    );

    // we check if the 'x-include-drafts' header is set, but in datocms/index.ts we conditionally append the 'X-Include-Drafts' header
    // note the difference in casing -- HTTP headers are case-insensitive and are often normalized to lowercase when processed
    // this is why we check for 'x-include-drafts' instead of 'X-Include-Drafts'

    // test implementation when HEAD_START_PREVIEW is true
    (env.HEAD_START_PREVIEW as boolean) = true;
    await datocmsRequest({ query: parse('query MockQuery { id }') });
    expect(requestHeaders['x-include-drafts']).toBe('true');

    // test implementation when HEAD_START_PREVIEW is false
    (env.HEAD_START_PREVIEW as boolean) = false;
    await datocmsRequest({ query: parse('query MockQuery { id }') });
    expect(requestHeaders['x-include-drafts']).toBeUndefined();
  });
});
