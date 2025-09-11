import type { parseFormSubmission } from '@lib/forms/parse.ts';
import type { CollectionEntry } from '@lib/content';

export default async function handleFormSubmission<T extends CollectionEntry<'Forms'>['data']>(
  result: Awaited<ReturnType<typeof parseFormSubmission<T>>>
) {
  console.log(result);
}
