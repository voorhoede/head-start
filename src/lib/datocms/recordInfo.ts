/**
 * Maps a DatoCMS record (CMA item) to the website path for Web Previews and similar plugins.
 * Used by the Preview Links API to return preview URLs for the Web Previews plugin.
 */

type CmaItem = {
  id: string;
  attributes?: Record<string, unknown> & { slug?: string };
  meta?: { status?: string };
};


export function recordToWebsiteRoute(
  item: CmaItem,
  itemTypeApiKey: string,
  locale: string,
): string | null {
  switch (itemTypeApiKey) {
  case 'home_page':
    return `/${locale}/`;
  case 'not_found_page':
    return `/${locale}/404`;
  case 'page': {
    const slug = item.attributes?.slug;
    if (typeof slug !== 'string' || !slug) return null;
    return `/api/reroute/page/${locale}/${encodeURIComponent(slug)}`;
  }
  default:
    return null;
  }
}
