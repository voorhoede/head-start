import 'astro/import-meta';
import { print } from 'graphql/language/printer';
import type { DocumentNode } from 'graphql';
import type { SiteLocale } from '@lib/i18n.types';
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

export const datocmsSearch = async({ locale, query, fuzzy = true }: { locale: SiteLocale, query: string, fuzzy?: boolean }) => {
  const url = new URL('https://site-api.datocms.com/search-results');
  url.searchParams.set('locale', locale);
  url.searchParams.set('q', query); // DatoCMS docs say this should be 'query', but that results in a 422 error
  if (fuzzy){
    url.searchParams.set('fuzzy', 'true');
  }
  // url.searchParams.set('build_trigger_id', '30535');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${import.meta.env.DATOCMS_READONLY_API_TOKEN}`,
      'Accept': 'application/json',
      'X-Api-Version': '3',
    },
  });

  if (!response.ok) {
    throw new Error(`DatoCMS search API returned ${response.status} ${response.statusText}`);
  }

  return response.json();
};
