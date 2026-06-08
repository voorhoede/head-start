import { defineMiddleware } from 'astro:middleware';

/**
 * Link Headers (RFC 8288):
 * Advertise machine-readable resources to agents and crawlers via the `Link`
 * response header. `/llms.txt` is a plain-text description of the site for LLMs,
 * exposed here with the registered `describedby` relation type.
 *
 * @see https://www.rfc-editor.org/rfc/rfc8288 (Web Linking)
 * @see https://www.iana.org/assignments/link-relations/link-relations.xhtml
 *
 * ⚠️ These headers are only applied to runtime responses, so keep these rules in sync
 *    with their static counterparts in public/_headers
 */
const linkHeader = '</llms.txt>; rel="describedby"; type="text/plain"';

export const linkheaders = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.has('Link')) {
    response.headers.set('Link', linkHeader);
  }
  return response;
});
