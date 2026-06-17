import { getEntry } from '~/lib/content';
import { validateSubmission } from '~/lib/forms';
import { Form, FormNotFound } from '~/components/Form';
import type { APIRoute } from 'astro';
import { renderToString } from '~/lib/renderer';

import NotFound from '~/pages/404.astro';

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const requestHeaders = Object.fromEntries(request.headers);
  const responseHeaders = new Headers({ 'Content-Type': 'text/html' });
  const { slug } = params;

  if (request.method !== 'POST' || !requestHeaders.referer || !slug) {
    return new Response(await renderToString(NotFound), { status: 404, headers: responseHeaders });
  }
  const partial = requestHeaders?.['x-requested-by'] === 'client';

  type ActionResult = { success: boolean; values: Record<string, string>; errors: Record<string, string> };
  let action: (result: ActionResult, partial: boolean) => Promise<Response>;
  try {
    action = (await import(`./_${slug}.ts`)).default;
  } catch {
    return new Response(
      await renderToString(FormNotFound, { props: { slug }, partial }),
      { status: 500, headers: responseHeaders }
    );
  }

  const form = await getEntry('Forms', slug);

  if (form) {
    const { success, values, errors } = await validateSubmission({
      form: form.data,
      formData: await request.formData(),
      requestHeaders: request.headers,
    });

    if (!success) {
      return new Response(
        await renderToString(Form, {
          props: {
            slug,
            formFields: form.data.formFields,
            submitLabel: form.data.submitLabel,
            errors,
            formValues: values,
          },
          partial,
        }),
        { status: 400, headers: responseHeaders }
      );
    }
    return await action({ success, values, errors }, partial);
  } else {
    return new Response(await renderToString(FormNotFound, {
      props: { slug: params.slug },
      partial
    }), { status: 500, headers: responseHeaders });
  }
};
