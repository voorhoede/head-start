import type { validateSubmission } from '~/lib/forms';
import type { CollectionEntry } from '~/lib/content';
import { renderToString } from '~/lib/renderer';
import { FormSuccess } from '~/components/Form';

export const prerender = false;

export default async function <T extends CollectionEntry<'Forms'>['data']>(
  result: Awaited<ReturnType<typeof validateSubmission<T>>>,
  partial: boolean = false,
) {
  return new Response(await renderToString(FormSuccess, { partial }), {
    status: 200,
    headers: new Headers({ 'Content-Type': 'text/html' }),
  });
}
