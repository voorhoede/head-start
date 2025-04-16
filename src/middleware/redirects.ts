import { defineMiddleware } from 'astro:middleware';
import { getRedirectTarget } from '@lib/routing/redirects';

/**
 * Redirects middleware:
 * If there is no matching route (404) and there is a matching redirect rule,
 * redirect to the target URL with the specified status code.
 */
export const redirects = defineMiddleware(async ({ request, redirect }, next) => {
  const response = await next();
  if (response.status === 404) {
    const { pathname } = new URL(request.url);
    const redirectTarget = getRedirectTarget(pathname);
    if (redirectTarget) {
      return redirect(redirectTarget.url, redirectTarget.statusCode);
    }
  }
  return response;
});
