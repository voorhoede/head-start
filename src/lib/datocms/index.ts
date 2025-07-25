import { Kind, parse, type DocumentNode, type FragmentDefinitionNode, type OperationDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';
import type { SiteLocale } from '@lib/datocms/types';
import { titleSuffix } from '@lib/seo';
import { datocmsBuildTriggerId, datocmsEnvironment } from '@root/datocms-environment';
import { output } from '@root/config/output';
import { DATOCMS_READONLY_API_TOKEN, HEAD_START_PREVIEW } from 'astro:env/server';
import { stripIndents } from 'proper-tags';

const wait = (milliSeconds: number) => new Promise((resolve) => setTimeout(resolve, milliSeconds));

export const datocmsAssetsOrigin = 'https://www.datocms-assets.com/';
export const datocmsGraphqlOrigin = 'https://graphql.datocms.com/';

type DatocmsRequest = {
  query: DocumentNode;
  variables?: { [key: string]: string };
  retryCount?: number;
};

/**
 * Expect return value of specified Query to be available, i.e. non-nullable.
 */
type Assert<Query> = Required<{ [key in keyof Query]: NonNullable<Query[key]> }>;

/**
 * Makes a request to the DatoCMS GraphQL API using the provided query and variables.
 * It has authorization, environment and drafts (preview) pre-configured.
 * It has a retry mechanism in case of rate-limiting, based on DatoCMS API utils. @see https://github.com/datocms/js-rest-api-clients/blob/f4e820d/packages/rest-client-utils/src/request.ts#L239C13-L255
 * 
 * @template {Object} Query - The expected response data structure
 * @template {boolean} AssertReturnValue - Whether to assert non-nullability of the return value, defaults to true for static output
 * 
 * @param options - Request options
 * @param options.query - The GraphQL query document
 * @param options.variables - Variables to pass to the GraphQL query
 * @param options.retryCount - Number of retry attempts in case of rate limiting
 * 
 * @returns A promise resolving to the query result, with optional type assertion
 */
export async function datocmsRequest<
  Query,
  AssertReturnValue extends boolean = typeof output extends 'static' ? true : false
>(
  {
    query,
    variables = {},
    retryCount = 1,
  }: DatocmsRequest,
): Promise<AssertReturnValue extends true ? Assert<Query> : Query> {
  const headers = new Headers({
    Authorization: DATOCMS_READONLY_API_TOKEN,
    'Content-Type': 'application/json',
    'X-Environment': datocmsEnvironment,
    'X-Exclude-Invalid': 'true', // https://www.datocms.com/docs/content-delivery-api/api-endpoints#strict-mode-for-non-nullable-graphql-types
  });
  if (HEAD_START_PREVIEW) {
    headers.append('X-Include-Drafts', 'true');
  }

  const response = await fetch(datocmsGraphqlOrigin, {
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
    return datocmsRequest<Query, AssertReturnValue>({ query, variables, retryCount: retryCount + 1 });
  }

  if (!response.ok) {
    throw Error(`DatoCMS request failed with status ${response.status}`);
  }

  const { data, errors } = await response.json();
  if (errors) {
    const definition = query.definitions.find(
      (definition): definition is OperationDefinitionNode => definition.kind === Kind.OPERATION_DEFINITION
    );
    const type = definition?.operation;
    const name = definition?.name?.value;
    const operation = (type && name)
      ? `"${type} ${name}"`
      : 'unknown operation';
    throw Error(stripIndents`
      DatoCMS request failed for ${operation}
      ` +
      JSON.stringify(errors, null, 4)
    );
  }
  return data;
}

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

// src: https://github.com/datocms/react-datocms/blob/master/src/useSiteSearch/index.tsx#L29C1-L42C3
export type RawSearchResult = {
  type: 'search_result';
  id: string;
  attributes: {
    title: string;
    body_excerpt: string;
    url: string;
    score: number;
    highlight: {
      title?: string[] | null;
      body?: string[] | null;
    };
  };
};

type SearchResponse = {
  data: RawSearchResult[];
  meta: {
    total_count: number;
  };
};

export const formatSearchResults = ({ query, results }: { query: string, results: RawSearchResult[] }) => {
  return results.map((result) => {
    const { title, body_excerpt, highlight, score, url } = result.attributes;
    const defaultMatch = {
      matchingTerm: query,
      markedText: body_excerpt.replace(/</g, '&lt;'), // escape HTML tags
    };
    const markedTextPattern = /\[h\](.+?)\[\/h\]/g;
    const matches = (highlight.body || []).map(bodyText => ({
      matchingTerm: markedTextPattern.exec(bodyText)?.[1] || query,
      markedText: bodyText
        .replace(/</g, '&lt;') // escape HTML tags
        .replace(markedTextPattern, (_: string, text: string) => `<mark>${text}</mark>`),
    }));
    const { pathname } = new URL(url);
    // use Text Fragment for deeplinking: https://developer.mozilla.org/en-US/docs/Web/Text_fragments
    const textFragmentUrl = `${url}#:~:${matches.map(({ matchingTerm }) => `text=${encodeURIComponent(matchingTerm)}`).join('&')}`;

    return {
      title: title.replace(new RegExp(`${titleSuffix()}$`), '').trim(),
      matches: matches.length ? matches : [defaultMatch],
      score,
      pathname,
      textFragmentUrl,
      url
    };
  });
};

export const datocmsSearch = async ({ locale, query, fuzzy = true }: { locale: SiteLocale, query: string, fuzzy?: boolean }) => {
  const url = new URL('https://site-api.datocms.com/search-results');
  url.searchParams.set('locale', locale);
  url.searchParams.set('q', query); // DatoCMS docs say this should be 'query', but that results in a 422 error
  if (fuzzy) {
    url.searchParams.set('fuzzy', 'true');
  }
  url.searchParams.set('build_trigger_id', datocmsBuildTriggerId);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${DATOCMS_READONLY_API_TOKEN}`,
      'Accept': 'application/json',
      'X-Api-Version': '3',
    },
  });

  if (!response.ok) {
    throw new Error(`DatoCMS search API returned ${response.status} ${response.statusText}`);
  }

  const { data, meta } = await response.json() as SearchResponse;
  const results = formatSearchResults({ query, results: data });

  return { meta, results };
};
