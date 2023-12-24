import type { APIRoute } from 'astro';
import parser from 'accept-language-parser';
import { cookieName, defaultLocale, locales } from '@lib/i18n';
import type { SiteLocale } from '@lib/i18n.types';

export const prerender = false;

const redirect = (url: string) => new Response('',{
  status: 302,
  headers: { 'Location': url },
});

/**
 * Redirect to the home page in the user's preferred language.
 */
export const GET: APIRoute = ({ cookies, request }) => {
  const userLocale = cookies.get(cookieName)?.value as SiteLocale;
  if (userLocale && locales.includes(userLocale)) {
    return redirect(`/${userLocale}/`);
  }

  const systemLocale = parser.pick(locales, request.headers.get('accept-language') as string);
  if (systemLocale) {
    return redirect(`/${systemLocale}/`);
  }

  return redirect(`/${defaultLocale}/`);
};
