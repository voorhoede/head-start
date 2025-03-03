import { defineMiddleware } from 'astro/middleware';
import { getFileUrlByPath } from '@lib/routing/file';

/**
 * Proxy files middleware:
 * If there is no matching route (404) and there is a file with a matching custom slug,
 * proxy the file from DatoCMS assets.
 */
export const proxyFiles = defineMiddleware(async ({ request }, next) => {
  const originalResponse = await next();

  // only process 404 responses
  if (originalResponse.status !== 404) {
    return originalResponse;
  }

  const { pathname } = new URL(request.url);
  const fileUrl = getFileUrlByPath(pathname);
  if (!fileUrl) {
    return originalResponse;
  }

  const fileResponse = await fetch(fileUrl);
  if (!fileResponse.ok) {
    return originalResponse;
  }

  // Astro forces the original 404 status unless we use `X-Astro-Rewrite: true`
  // @see https://github.com/withastro/roadmap/discussions/665#discussioncomment-6831528
  return new Response(fileResponse.body, {
    ...fileResponse,
    headers: {
      ...fileResponse.headers,
      'X-Astro-Rewrite': 'true',
    },
  });
});
