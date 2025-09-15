import { Kind, parse, type DocumentNode, type FragmentDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';
import { datocmsRequest } from './request';

/**
 * Returns all records from a DatoCMS collection (like 'Pages')
 * with data for each record based on the provided fragment.
 *
 * DatoCMS GraphQL API has a limit of 100 records per request.
 * This function uses pagination to get all records.
 * @see https://www.datocms.com/docs/content-delivery-api/pagination
 * 
 * @param {string} params.collection 
 * - The name of the DatoCMS collection. For example, `"Pages"`
 * @param {DocumentNode|string} params.fragment 
 * - The GraphQL fragment to include for each record, For example `pageRouteFragment`.
 */
export async function datocmsCollection<CollectionType>({
  collection,
  fragment
}: {
  collection: string;
  fragment: string | DocumentNode;
}) {
  const records: CollectionType[] = [];

  const { count, type } = await getCollectionMetadata(collection);
  if (!type || !count) return records; // Function has to have early return if type is null.

  const recordsPerPage = 100; // DatoCMS GraphQL API has a limit of 100 records per request
  const totalPages = Math.ceil(count / recordsPerPage);

  const { fragmentName, fragmentDocument } = getFragmentNameAndDocument({ fragment, type });

  const key = 'entries' as const;
  for (let page = 0; page < totalPages; page++) {
    const data = await datocmsRequest<{ [key]: CollectionType[] }>({
      query: parse(/* graphql */`
        # Insert fragment definition from fragmentDocument, 
        # which is either the fragment passed from an import from @lib/datocms/types.ts 
        # or the one created from a string;
        ${fragmentDocument}
        
        query All${collection} {
          ${key}: all${collection} (
             first: ${recordsPerPage},
             skip: ${page * recordsPerPage}
          ) {
            ...${fragmentName}
          }
        }
      `)
    });

    records.push(...data[key]);
  }

  return records;
}

export const inlineFragmentName = 'InlineFragment';

export function getFragmentNameAndDocument({
  fragment,
  type,
}: {
  fragment: string | DocumentNode,
  type: string
}): {
  fragmentName: string,
  fragmentDocument: string,
} {
  // Create new fragment to maintain support for passing a string to argument fragment
  const fragmentDocument = typeof fragment === 'string'
    ? parse(`fragment ${inlineFragmentName} on ${type} { ${fragment} }`)
    : fragment;
  const { definitions } = fragmentDocument;
  const fragmentDefinition = definitions
    .find((definition): definition is FragmentDefinitionNode =>
      definition.kind === Kind.FRAGMENT_DEFINITION
    );
  const fragmentName = fragmentDefinition?.name?.value;
  if (!fragmentName) {
    throw new Error('Fragment definition has no name.');
  }
  return {
    fragmentName,
    fragmentDocument: print(fragmentDocument),
  };
}

export type CollectionInfo = {
  meta: { count: number };
  records: [] | [{ __typename: string }];
};

/**
 * Fetches type and number of records for collection.
 * Note that when there are no records for a collection, the type is `null`.
 * 
 * @param collection 
 * @returns 
 */
export async function getCollectionMetadata(collection: string): Promise<{
  count: number, type: string | null
}> {
  const query = parse(/* graphql */`
    query ${collection}Meta {
      # Fetch first record to get the __typename to be used for the fragment created from a string
      records: all${collection}(first: 1) { __typename }
      meta: _all${collection}Meta { count }
    }
 `);
  const {
    meta: { count },
    records: [
      { __typename: type } = { __typename: null } // Collection might be empty
    ]
  } = await datocmsRequest<CollectionInfo>({ query });

  return { count, type }
}
