import { getEntry } from '~/lib/content';
import { validateSubmission } from '~/lib/forms';
import { Form, FormError, FormNotFound } from '~/components/Form';
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
      { status: 404, headers: responseHeaders }
    );
  }

  const form = await getEntry('Forms', slug);

  if (form) {
    let result: ActionResult;
    try {
      result = await validateSubmission({
        form: form.data,
        formData: await request.formData(),
        requestHeaders: request.headers,
      });
    } catch (error) {
      console.error('Form validation error:', error);
      return new Response(
        await renderToString(FormError, { partial }),
        { status: 500, headers: responseHeaders }
      );
    }

    if (!result.success) {
      if (partial) {
        const jsonHeaders = new Headers(responseHeaders);
        jsonHeaders.set('Content-Type', 'application/json');
        return new Response(
          JSON.stringify({ errors: result.errors }),
          { status: 400, headers: jsonHeaders }
        );
      }
      return new Response(
        await renderToString(Form, {
          props: {
            slug,
            formFields: form.data.formFields,
            submitLabel: form.data.submitLabel,
            errors: result.errors,
            formValues: result.values,
          },
          partial,
        }),
        { status: 400, headers: responseHeaders }
      );
    }

    try {
      return await action(result, partial);
    } catch (error) {
      console.error('Form submission error:', error);
      return new Response(
        await renderToString(FormError, { partial }),
        { status: 500, headers: responseHeaders }
      );
    }
  } else {
    return new Response(await renderToString(FormNotFound, {
      props: { slug: params.slug },
      partial
    }), { status: 404, headers: responseHeaders });
  }
};
