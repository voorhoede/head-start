import type { APIRoute } from 'astro';
import { locales } from '@lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';
import { datocmsSearch } from '@lib/datocms';
import { minQueryLength, queryParamName } from '@lib/search';

export const prerender = false;

const jsonResponse = (data: object, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Get search results using DatoCMS Site Search: https://www.datocms.com/docs/site-search
 * URL query parameters:
 * - locale: Site locale (required)
 * - query: Search query (required)
 * - fuzzy: Use fuzzy search? Use 'true'|'1'|'false'|'0' (optional, default: 'true')
 */
export const GET: APIRoute = async ({ request }) => {
  // Search parameters are handled as query parameters rather than path parameters,
  // so we can provide meaning error messages (400) rather than returning 404 responses.
  const params = Object.fromEntries(new URL(request.url).searchParams.entries()) as { fuzzy: string, locale: SiteLocale, query: string };
  const { locale } = params;
  const query = params[queryParamName];
  const fuzzy = !params.fuzzy || params.fuzzy === 'true' || params.fuzzy === '1';
  if (!locale) {
    return jsonResponse({ error: 'Missing \'locale\' parameter' }, 400);
  }
  if (!locales.includes(locale)) {
    return jsonResponse({ error: `Invalid 'locale' parameter. Supported locales: '${locales.join('\', \'')}'` }, 400);
  }
  if (!query) {
    return jsonResponse({ error: `Missing '${queryParamName}' parameter` }, 400);
  }
  if (query.length < minQueryLength) {
    return jsonResponse({ error: `Invalid '${queryParamName}' parameter. Minimum length: ${minQueryLength}` }, 400);
  }

  try {
    const data = await datocmsSearch({ locale, query, fuzzy });
    return jsonResponse({ data });
  } catch (error) {
    console.error('Error searching DatoCMS', error);
    return jsonResponse({ error: 'Error searching DatoCMS' }, 500);
  }
};
