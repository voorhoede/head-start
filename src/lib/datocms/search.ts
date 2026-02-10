import type { SiteLocale } from '@lib/datocms/types';
import { titleSuffix } from '@lib/seo';
import { datocmsBuildTriggerId } from '@root/datocms-environment';
import { DATOCMS_READONLY_API_TOKEN } from 'astro:env/server';

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
