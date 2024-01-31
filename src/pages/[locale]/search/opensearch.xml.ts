import type { APIRoute } from 'astro';
import { locales } from '@lib/i18n';
import { datocmsRequest } from '@lib/datocms';
import type { OpenSearchXmlQuery, Site } from '@lib/types/datocms';
import { getSearchPathname, getOpenSearchName, queryParamName } from '@lib/search';
import query from './_opensearch.query.graphql';

export const prerender = true;

export async function getStaticPaths() {
  return locales.map(locale => ({ params: { locale } }));
}

const openSearchXml = (
  { shortName, description, favicons, language, resultsHtmlUrl, searchFormUrl }: 
  { shortName: string, description: string, favicons: { width: number, height: number, type: string, url: string }[], language: string, resultsHtmlUrl: string, searchFormUrl: string }
) => /* xml */`

<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"
                       xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>${ shortName }</ShortName>
  <Description>${ description }</Description>
  <InputEncoding>UTF-8</InputEncoding>
  ${ favicons.map(({ width, height, type, url }) => (
    `<Image width="${ width }" height="${ height }" type="${ type }">${ url }</Image>`
  )).join('\n  ') }
  <Language>${ language }</Language>
  <Url type="text/html" method="get" template="${ resultsHtmlUrl }"/>
  <moz:SearchForm>${ searchFormUrl }</moz:SearchForm>
</OpenSearchDescription>

`.trim();

export const GET: APIRoute = async ({ params, site }) => {
  const locale = params.locale!;
  const data = await datocmsRequest<OpenSearchXmlQuery>({ query, variables: { locale } }) as { site: Site };
  const { favicon, globalSeo } = data.site;
  const searchPageUrl = `${ site!.origin }${ getSearchPathname(locale) }`;

  return new Response(openSearchXml({
    shortName: getOpenSearchName(locale),
    description: globalSeo?.fallbackSeo?.description || '',
    favicons: favicon ? [
      { width: 64, height: 64, type: 'image/png', url: `${favicon.url}?fm=png&amp;w=64&amp;h=64` },
    ] : [],
    language: locale,
    searchFormUrl: searchPageUrl,
    resultsHtmlUrl: `${ searchPageUrl }?${ queryParamName }={searchTerms}`,
  }), {
    headers: {
      'content-type': 'application/opensearchdescription+xml',
    },
  });
};
