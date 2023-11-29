import 'astro/import-meta';
import { parse } from 'graphql';
import { print } from 'graphql/language/printer';
import type { DocumentNode } from 'graphql';
import { datocmsEnvironment } from '../../datocms-environment';

type DatocmsRequestType = {
  query: DocumentNode;
  variables?: { [key: string]: string };
};

export const datocmsRequest = <T>({ query, variables = {} }: DatocmsRequestType): Promise<T> => {
  return fetch('https://graphql.datocms.com/', {
    method: 'post',
    headers: {
      Authorization: import.meta.env.DATOCMS_READONLY_API_TOKEN,
      'Content-Type': 'application/json',
      'X-Environment': datocmsEnvironment,
      'X-Exclude-Invalid': 'true', // https://www.datocms.com/docs/content-delivery-api/api-endpoints#strict-mode-for-non-nullable-graphql-types
      // "X-Include-Drafts": preview ? "true" : "false",
    },
    body: JSON.stringify({ query: print(query), variables }),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.errors) throw Error(JSON.stringify(response, null, 4));
      return response.data;
    });
};

interface CollectionData<CollectionType> {
  [key: string]: CollectionType[];
}
type CollectionMeta = {
  count: number;
};
/**
 * Returns all records from a DatoCMS collection (like 'Pages')
 * with data for each record based on the provided fragment.
 * 
 * DatoCMS GraphQL API has a limit of 100 records per request.
 * This function uses pagination to get all records.
 * @see https://www.datocms.com/docs/content-delivery-api/pagination
 */
export const datocmsCollection = async <CollectionType>({ 
  collection,
  fragment
}: { 
  collection: string, 
  fragment: string
}) => {
  const { meta } = await datocmsRequest({
    query: parse(/* graphql */`
      query ${collection}Meta {
        meta: _all${collection}Meta { count }
      }
   `)
  }) as { meta: CollectionMeta };

  const recordsPerPage = 100; // DatoCMS GraphQL API has a limit of 100 records per request
  const totalPages = Math.ceil(meta.count / recordsPerPage);
  const records: CollectionType[] = [];

  for (let page = 0; page < totalPages; page++) {
    const data = await datocmsRequest({
      query: parse(/* graphql */`
        query All${collection} {
          ${collection}: all${collection} (
             first: ${recordsPerPage}, 
             skip: ${page * recordsPerPage}
          ) {
            ${fragment}
          }
        }
      `),
    }) as CollectionData<CollectionType>;

    records.push(...data[collection]);
  }

  return records;
};
