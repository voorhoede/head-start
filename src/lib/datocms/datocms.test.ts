import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { HttpResponse, graphql } from 'msw';
import { setupServer } from 'msw/node';
import { parse } from 'graphql/language';
import { datocmsRequest } from './index';

// query is not actually used, but it cannot be empty because the parse function will throw an error
const query = parse(`
  query Mock {
    id
  }
`);

const mockData = [
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
  vi.unstubAllEnvs();
});

afterAll(() => server.close());

describe('datocms: "datocmsRequest"', () => {
  test('should successfully fetch data', async () => {
    server.use(
      graphql.query('Mock', () => {
        return HttpResponse.json({ data: { mockData } });
      }),
    );

    const response = await datocmsRequest({ query });
    expect(response).toEqual({ mockData });
  });

  test('should throw an error if the response contains GraphQL errors', async () => {
    const errorResponse = [{ message: 'Something went wrong' }];

    server.use(
      graphql.query('Mock', () => {
        return HttpResponse.json(
          { errors: errorResponse },
          { status: 200 }
        );
      }),
    );

    let response: Error;

    try {
      await datocmsRequest({ query });
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
    let numberOfAttempts = 0;

    server.use(
      graphql.query('Mock', () => {
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

    const response = await datocmsRequest({ query });
    expect(numberOfAttempts).toBe(2);
    expect(response).toEqual({ mockData });
  });

  test('should include headers that ask for drafts in response when HEAD_START_PREVIEW is truthy', async () => {
    let requestHeaders: Record<string, string> = {};

    server.use(
      graphql.query('Mock', async ({ request }) => {
        requestHeaders = Object.fromEntries(request.headers);

        return HttpResponse.json({ data: { mockData } });
      }),
    );

    // we check if the 'x-include-drafts' header is set, but in datocms/index.ts we set conditionally append the 'X-Include-Drafts' header
    // note the difference in casing -- HTTP headers are case-insensitive and are often normalized to lowercase when processed
    // this is why we check for 'x-include-drafts' instead of 'X-Include-Drafts'

    // 'true' instead of true because subEnv expects a string
    vi.stubEnv('HEAD_START_PREVIEW', 'true');
    await datocmsRequest({ query });
    expect(requestHeaders['x-include-drafts']).toBe('true');

    // empty string because subEnv expects a string, but the value should be falsy
    vi.stubEnv('HEAD_START_PREVIEW', '');
    await datocmsRequest({ query });
    expect(requestHeaders['x-include-drafts']).toBeUndefined();
  });
});
