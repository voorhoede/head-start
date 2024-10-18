import { parse } from 'graphql';
import { print } from 'graphql/language/printer';
import type { DocumentNode } from 'graphql';
import type { SiteLocale } from '@lib/i18n.types';
import { titleSuffix } from './seo';
import { datocmsBuildTriggerId, datocmsEnvironment } from '../../datocms-environment';
import { DATOCMS_READONLY_API_TOKEN, HEAD_START_PREVIEW } from 'astro:env/server';

const wait = (milliSeconds: number) => new Promise((resolve) => setTimeout(resolve, milliSeconds));

type DatocmsRequest = {
  query: DocumentNode;
  variables?: { [key: string]: string };
  retryCount?: number;
};
/**
 * Makes a request to the DatoCMS GraphQL API using the provided query and variables.
 * It has authorization, environment and drafts (preview) pre-configured.
 * It has a retry mechanism in case of rate-limiting, based on DatoCMS API utils. @see https://github.com/datocms/js-rest-api-clients/blob/f4e820d/packages/rest-client-utils/src/request.ts#L239C13-L255
 */
export const datocmsRequest = async <T>({ query, variables = {}, retryCount = 1 }: DatocmsRequest): Promise<T> => {
  const headers = new Headers({
    Authorization: DATOCMS_READONLY_API_TOKEN,
    'Content-Type': 'application/json',
    'X-Environment': datocmsEnvironment,
    'X-Exclude-Invalid': 'true', // https://www.datocms.com/docs/content-delivery-api/api-endpoints#strict-mode-for-non-nullable-graphql-types
  });
  if (HEAD_START_PREVIEW) {
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

  if (!response.ok) {
    throw Error(`DatoCMS request failed with status ${response.status}`);
  }

  const { data, errors } = await response.json();
  if (errors) throw Error(JSON.stringify(errors, null, 4));
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

// src: https://github.com/datocms/react-datocms/blob/master/src/useSiteSearch/index.tsx#L29C1-L42C3
type RawSearchResult = {
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
const formatSearchResults = ({ query, results }: { query: string, results: RawSearchResult[] }) => {
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
    const textFragmentUrl = `${url}#:~:${ matches.map(({ matchingTerm }) => `text=${encodeURIComponent(matchingTerm)}`).join('&')}`;

    return {
      title: title.replace(new RegExp(`${titleSuffix}$`), '').trim(),
      matches: matches.length ? matches : [defaultMatch],
      score,
      pathname,
      textFragmentUrl,
      url
    };
  });
};

export const datocmsSearch = async({ locale, query, fuzzy = true }: { locale: SiteLocale, query: string, fuzzy?: boolean }) => {
  const url = new URL('https://site-api.datocms.com/search-results');
  url.searchParams.set('locale', locale);
  url.searchParams.set('q', query); // DatoCMS docs say this should be 'query', but that results in a 422 error
  if (fuzzy){
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
