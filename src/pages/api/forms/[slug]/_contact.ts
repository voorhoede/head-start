import type { FormActionHandler } from '~/lib/forms';
import { renderToString } from '~/lib/renderer';
import { FormSuccess } from '~/components/Form';

export const prerender = false;

const handler: FormActionHandler = async (_result, partial = false) => {
  return new Response(await renderToString(FormSuccess, { partial }), {
    status: 200,
    headers: new Headers({ 'Content-Type': 'text/html' }),
  });
};

export default handler;
