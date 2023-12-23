import { print } from 'graphql/language/printer';
import type { DocumentNode } from 'graphql';
import { datocmsEnvironment } from '../../datocms-environment';

type DatocmsRequestType = {
  query: DocumentNode;
  variables?: { [key: string]: string };
};

export const datocmsRequest = <T>({ query, variables = {} }: DatocmsRequestType): Promise<T> => {
  const headers = new Headers({
    Authorization: import.meta.env.DATOCMS_READONLY_API_TOKEN,
    'Content-Type': 'application/json',
    'X-Environment': datocmsEnvironment,
    'X-Exclude-Invalid': 'true', // https://www.datocms.com/docs/content-delivery-api/api-endpoints#strict-mode-for-non-nullable-graphql-types
  });
  if (import.meta.env.HEAD_START_PREVIEW) {
    headers.append('X-Include-Drafts', 'true');
  }

  return fetch('https://graphql.datocms.com/', {
    method: 'post',
    headers,
    body: JSON.stringify({ query: print(query), variables }),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.errors) throw Error(JSON.stringify(response, null, 4));
      return response.data;
    });
};
