import { Kind, parse, type DocumentNode, type FragmentDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';
import { datocmsRequest } from './request';

type CollectionData<CollectionType> = {
  [key: string]: CollectionType[];
}

export type CollectionInfo = {
  meta: { count: number };
  records: [] | [{ __typename: string }];
};

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
  const {
    meta,
    records: [
      { __typename: type } = { __typename: null } // Collection might be empty
    ]
  } = await datocmsRequest<CollectionInfo>({
    query: parse(/* graphql */`
      query ${collection}Meta {
        # Fetch first record to get the __typename to be used for the fragment created from a string
        records: all${collection}(first: 1) { __typename }
        meta: _all${collection}Meta { count }
      }
   `)
  });
  
  const records: CollectionType[] = [];

  // The type is used to create a fragment from a string. Without it, that fails.
  // But the type is null because the collection is empty, so we don't need to fetch any records.
  if (!type) return records;
  
  const recordsPerPage = 100; // DatoCMS GraphQL API has a limit of 100 records per request
  const totalPages = Math.ceil(meta.count / recordsPerPage);
 
  // Create new fragment to maintain support for passing a string to argument fragment
  const fragmentDocument = typeof fragment === 'string'
    ? parse(`fragment InlineFragment on ${type} { ${fragment} }`)
    : fragment;
  const { definitions } = fragmentDocument;
  const fragmentDefinition = definitions
    .find((definition): definition is FragmentDefinitionNode =>
      definition.kind === Kind.FRAGMENT_DEFINITION
    );

  for (let page = 0; page < totalPages; page++) {
    const data = await datocmsRequest<CollectionData<CollectionType>>({
      query: parse(/* graphql */`
        # Insert fragment definition from fragmentDocument, 
        # which is either the fragment passed from an import from @lib/datocms/types.ts 
        # or the one created from a string;
        ${print(fragmentDocument)}
        
        query All${collection} {
          ${collection}: all${collection} (
             first: ${recordsPerPage},
             skip: ${page * recordsPerPage}
          ) {
            ...${fragmentDefinition?.name?.value}
          }
        }
      `),
    });

    records.push(...data[collection]);
  }

  return records;
}
