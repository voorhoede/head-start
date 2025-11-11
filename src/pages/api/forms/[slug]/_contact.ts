import type { validateSubmission } from '@lib/forms';
import type { CollectionEntry } from '@lib/content';
import { FormSuccess } from '@components/Form';
import { renderToString } from '@lib/renderer';

export const prerender = false;

export default async function <T extends CollectionEntry<'Forms'>['data']>(
  result: Awaited<ReturnType<typeof validateSubmission<T>>>,
  partial: boolean = false,
) {
  console.log(result);
  return await renderToString(FormSuccess, { partial });
}
