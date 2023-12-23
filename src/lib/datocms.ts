import { parse } from 'graphql';
import { print } from 'graphql/language/printer';
import type { DocumentNode } from 'graphql';
import { datocmsEnvironment } from '../../datocms-environment';

const wait = (milliSeconds: number) => new Promise((resolve) => setTimeout(resolve, milliSeconds));

type DatocmsRequestType = {
  query: DocumentNode;
  variables?: { [key: string]: string };
  retryCount?: number;
};
/**
 * Makes a request to the DatoCMS GraphQL API using the provided query and variables.
 * It has authorization, environment and drafts (preview) pre-configured.
 * It has a retry mechanism in case of rate-limiting, based on DatoCMS API utils. @see https://github.com/datocms/js-rest-api-clients/blob/f4e820d/packages/rest-client-utils/src/request.ts#L239C13-L255
 */
export const datocmsRequest = async <T>({ query, variables = {}, retryCount = 1 }: DatocmsRequestType): Promise<T> => {
  const headers = new Headers({
    Authorization: import.meta.env.DATOCMS_READONLY_API_TOKEN,
    'Content-Type': 'application/json',
    'X-Environment': datocmsEnvironment,
    'X-Exclude-Invalid': 'true', // https://www.datocms.com/docs/content-delivery-api/api-endpoints#strict-mode-for-non-nullable-graphql-types
  });
  if (import.meta.env.HEAD_START_PREVIEW) {
    headers.append('X-Include-Drafts', 'true');
  }

  const response = await fetch('https://graphql.datocms.com/', {
    method: 'post',
    headers,
    body: JSON.stringify({ query: print(query), variables }),
  });

  const retryLimit = 5;
  if (response.status === 429) {
    const waitTimeInSeconds = response.headers.has('X-RateLimit-Reset')
      ? parseInt(response.headers.get('X-RateLimit-Reset')!, 10)
      : retryCount;
    await wait(waitTimeInSeconds * 1000);
    if (retryCount >= retryLimit) throw Error('DatoCMS request failed. Too many retries.');
    return datocmsRequest({ query, variables, retryCount: retryCount + 1 });
  }

  const { data, errors } = await response.json();
  if (errors) throw Error(JSON.stringify(response, null, 4));
  return data;
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
