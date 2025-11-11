import { getEntry } from '@lib/content';
import { validateSubmission } from '@lib/forms';
import { Form, FormNotFound } from '@components/Form';
import type { APIRoute } from 'astro';
import { renderToString } from '@lib/renderer';
import NotFound from '@pages/404.astro';

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const action = (await import(`./_${params.slug}.ts`)).default;
  const requestHeaders = Object.fromEntries(request.headers);
  const responseHeaders = new Headers({ 'Content-Type': 'text/html' });
  const { slug } = params;

  if (request.method !== 'POST' || !requestHeaders.referer || !slug) {
    return await renderToString(NotFound);
  }
  const partial = requestHeaders?.['x-requested-by'] === 'client';

  const form = await getEntry('Forms', slug);
  let formErrors: Record<string, string> = {};
  let formValues: Record<string, string> = {};

  if (form) {
    const { success, values, errors } = await validateSubmission({
      form: form.data,
      formData: await request.formData(),
      requestHeaders: request.headers,
    });
    formValues = values;
    formErrors = errors;

    if (!success) {
      return new Response(
        await renderToString(Form, {
          props: {
            slug: slug,
            formFields: form.data.formFields,
            errors: formErrors,
            formValues: formValues,
          },
          partial
        }), {
          status: 400,
          headers: responseHeaders
        });
    }
    return await action({ success, values, errors });
  } else {
    return new Response(await renderToString(FormNotFound, {
      props: { slug: params.slug },
      partial
    }), { status: 500, headers: responseHeaders });
  }
};
