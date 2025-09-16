import { Kind, type DocumentNode, type OperationDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';
import { datocmsEnvironment } from '@root/datocms-environment';
import { output } from '@root/config/output';
import { DATOCMS_READONLY_API_TOKEN, HEAD_START_PREVIEW } from 'astro:env/server';
import { stripIndents } from 'proper-tags';
import type { SiteLocale } from './types';

const wait = (milliSeconds: number) => new Promise((resolve) => setTimeout(resolve, milliSeconds));

export const datocmsAssetsOrigin = 'https://www.datocms-assets.com/';
export const datocmsGraphqlOrigin = 'https://graphql.datocms.com/';

export type LocaleVariables = {
  locale: SiteLocale;
  fallbackLocales: SiteLocale[];
};

export type QueryVariables = Partial<LocaleVariables> & { 
  [key: string]: unknown; 
};

export type DatocmsRequest = {
  query: DocumentNode;
  variables?: QueryVariables;
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
