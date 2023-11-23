import type { APIRoute } from 'astro';
import { locales } from '@lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';
import { datocmsSearch } from '@lib/datocms';

export const prerender = false;

const jsonResponse = (data: object, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const GET: APIRoute = async ({ request }) => {
  // Search parameters are handled as query parameters rather than path parameters,
  // so we can provide meaning error messages (400) rather than returning 404 responses.
  const params = Object.fromEntries(new URL(request.url).searchParams.entries()) as { fuzzy: string, locale: SiteLocale, query: string };
  const { locale, query } = params;
  if (!locale) {
    return jsonResponse({ error: 'Missing \'locale\' parameter' }, 400);
  }
  if (!locales.includes(locale)) {
    return jsonResponse({ error: `Invalid 'locale' parameter. Supported locales: '${locales.join('\', \'')}'` }, 400);
  }
  if (!query) {
    return jsonResponse({ error: 'Missing \'query\' parameter' }, 400);
  }

  try {
    const results = await datocmsSearch({ locale, query, fuzzy: Boolean(params.fuzzy) });
    return jsonResponse(results);
  } catch (error) {
    console.error('Error searching DatoCMS', error);
    return jsonResponse({ error: 'Error searching DatoCMS' }, 500);
  }
};
