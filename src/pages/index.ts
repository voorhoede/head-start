import type { APIRoute } from 'astro';
import parser from 'accept-language-parser';
import { defaultLocale, locales } from '@lib/i18n';

export const prerender = false;

const redirect = (url: string) => new Response('',{
  status: 302,
  headers: { 'Location': url },
});

/**
 * Redirect to the home page in the user's preferred language.
 */
export const GET: APIRoute = ({ request }) => {
  const acceptLanguage = request.headers.get('accept-language') as string;
  const userLocale = parser.pick(locales, acceptLanguage);
  if (userLocale) {
    return redirect(`/${userLocale}/`);
  }
  return redirect(`/${defaultLocale}/`);
};
