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
import { Kind, parse, type FragmentDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';
import { 
  datocmsCollection, 
  getFragmentNameAndDocument, 
  getQueryNameAndVariables, 
  inlineFragmentName, 
  type CollectionInfo 
} from './collection';
import type { LocaleVariables } from './request';

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
      data: { entries: mockCollection }
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
      data: { entries: mockCollection }
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
        return HttpResponse.json({ data: { entries: paginatedData } });
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

  test('should return an empty array if no records are found when searching with a string fragment', async () => {
    server.use(graphql.query('MyMockCollectionMeta', () => HttpResponse.json({
      data: {
        meta: { count: 0 },
        records: [{ __typename: 'MyMockRecord' }],
      } satisfies CollectionInfo,
    })));

    server.use(graphql.query('AllMyMockCollection', () => HttpResponse.json({
      data: { entries: [] }
    })));

    const records = await datocmsCollection({ collection: 'MyMockCollection', fragment: 'id title' });
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
    expect(response!.message).toContain(errorResponse[0].message);
  });
});

describe('getFragmentNameAndDocument:', () => {
  const type = 'MyMockRecord';
  const name = 'MyMockRecordFragment';
  const inlineFragment = /* graphql */`
    id
    title
  `;
  const createFragment = (name: string, type: string) => parse(/* graphql */`fragment ${name} on ${type} {
    ${inlineFragment}
  }`);
  const fragment = createFragment(name, type);

  test('returns a name and document for a parsed fragment', () => {
    const { fragmentName, fragmentDocument } = getFragmentNameAndDocument({ fragment, type });
    expect(fragmentName).toBe(name);
    expect(fragmentDocument).toBe(print(fragment));
  });

  test('returns a name and document for a fragment body as string', () => {
    const fragment = createFragment(inlineFragmentName, type);
    const { fragmentName, fragmentDocument } = getFragmentNameAndDocument({ fragment: inlineFragment, type });
    expect(fragmentName).toBe(inlineFragmentName);
    expect(fragmentDocument).toBe(print(fragment));
  });

  test('returns fragment on correct type for a fragment body as string', () => {
    const { fragmentDocument } = getFragmentNameAndDocument({ fragment: inlineFragment, type });
    const { definitions } = parse(fragmentDocument);
    const fragmentDefinition = definitions.find(({ kind }) => kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode;
    expect(fragmentDefinition.typeCondition.name.value).toBe(type);
  });
});

describe('queryNameAndVariables:', () => {
  const collection = 'Mocks';
  const variables: LocaleVariables = {
    locale: 'en',
    fallbackLocales: []
  };
  const fragment = `
    fragment MyMockRecordFragment on MyMockRecord {
      id
      slug
    }
  `;
  
  const fragmentWithVariables = `
    fragment MyMockRecordFragment on MyMockRecord {
      id
      slug(locale: $locale, fallbackLocales: $fallbackLocales)
    }
  `;
  
  test('returns just the query name when no variables are used in fragment', () => {
    const queryName = getQueryNameAndVariables({
      collection,
      variables,
      fragmentDocument: fragment,
    });
    expect(queryName).toBe(`All${collection}`);
  });
  
  test('returns just query name and variables when variables are used in fragment', () => {
    const queryName = getQueryNameAndVariables({
      collection,
      variables,
      fragmentDocument: fragmentWithVariables,
    });
    expect(queryName).toBe(`All${collection}($locale: SiteLocale!, $fallbackLocales: [SiteLocale!])`);
  });
});
