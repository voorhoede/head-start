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
import { parse } from 'graphql';
import { datocmsCollection, type CollectionInfo } from '@lib/datocms';

vi.mock('../../../../datocms-environment', () => ({
  datocmsBuildTriggerId: 'mock-build-trigger-id',
  datocmsEnvironment: 'mock-environment',
}));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

afterAll(() => server.close());

describe('datocmsCollection:', () => {
  const fragment = parse(/* graphql */`
    fragment MyMockRecordFragment on MyMockRecord {
      id
      title
    }
  `);

  test('supports passing fragment as a string', async () => {
    const totalRecords = 50;
    const mockCollection = Array.from({ length: totalRecords }, (_, i) => ({
      id: i + 1,
      title: `Record ${i + 1}`
    }));

    server.use(graphql.query('MyMockCollectionMeta', () => HttpResponse.json({
      data: {
        meta: { count: totalRecords },
        records: [{ __typename: 'MyMockRecord' }],
      } satisfies CollectionInfo,        
    })));

    server.use(graphql.query('AllMyMockCollection', () => HttpResponse.json({ 
      data: { MyMockCollection: mockCollection } 
    })));

    const records = await datocmsCollection({ collection: 'MyMockCollection', fragment: 'id title' });
    expect(records).toHaveLength(totalRecords);
    expect(records).toEqual(mockCollection);
  });


  test('should successfully fetch a non-paginated collection', async () => {
    const totalRecords = 50;
    const mockCollection = Array.from({ length: totalRecords }, (_, i) => ({
      id: i + 1,
      title: `Record ${i + 1}`
    }));

    server.use(graphql.query('MyMockCollectionMeta', () => HttpResponse.json({
      data: {
        meta: { count: totalRecords },
        records: [{ __typename: 'MyMockRecord' }],
      } satisfies CollectionInfo,        
    })));

    server.use(graphql.query('AllMyMockCollection', () => HttpResponse.json({ 
      data: { MyMockCollection: mockCollection } 
    })));

    const records = await datocmsCollection({ collection: 'MyMockCollection', fragment });
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

    server.use(graphql.query('MyMockCollectionMeta', () => HttpResponse.json({
      data: {
        meta: { count: totalRecords },
        records: [{ __typename: 'MyMockRecord' }],
      } satisfies CollectionInfo,        
    })));


    server.use(
      graphql.query('AllMyMockCollection', () => {
        const skip = requestCount * 100;
        const paginatedData = mockCollection.slice(skip, skip + recordsPerRequest);

        requestCount++;
        return HttpResponse.json({ data: { MyMockCollection: paginatedData } });
      }),
    );

    const records = await datocmsCollection({ collection: 'MyMockCollection', fragment });
    expect(records).toHaveLength(totalRecords);
    expect(records).toEqual(mockCollection);

    // should be 2 (requests) for 150 records with 100 per call
    const totalPages = Math.ceil(totalRecords / recordsPerRequest);
    expect(requestCount).toBe(totalPages);
  });

  test('should return an empty array if no records are found', async () => {
    server.use(graphql.query('MyMockCollectionMeta', () => HttpResponse.json({
      data: {
        meta: { count: 0 },
        records: [{ __typename: 'MyMockRecord' }],
      } satisfies CollectionInfo,        
    })));


    server.use(graphql.query('AllMyMockCollection', () => HttpResponse.json({ 
      data: { MyMockCollection: [] } 
    })));

    const records = await datocmsCollection({ collection: 'MyMockCollection', fragment });
    expect(records).toEqual([]);
  });

  test('should throw an error if the response contains GraphQL errors', async () => {
    const errorResponse = [{ message: 'Something went wrong' }];

    server.use(graphql.query('MyMockCollectionMeta', () => HttpResponse.json({
      data: {
        meta: { count: 1 },
        records: [{ __typename: 'MyMockRecord' }],
      } satisfies CollectionInfo,        
    })));

    server.use(graphql.query('AllMyMockCollection', () => HttpResponse.json(
      { errors: errorResponse },
      { status: 200 }
    )));

    let response: Error;

    try {
      await datocmsCollection({ collection: 'MyMockCollection', fragment });
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
