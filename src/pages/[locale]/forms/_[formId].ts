import type { APIRoute } from 'astro';
import { getEntry } from '@lib/content';
import { formReferrerFieldName, handleFormSubmission } from '@lib/forms';

export const prerender = false;

const htmlResponse = (html: string, status: number = 200) => {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html',
    },
  });
};

const jsonResponse = (data: object, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * ...
 */
export const POST: APIRoute = async ({ request, params }) => {
  const { formId } = params;
  const formData = await request.formData();
  const referrerPath = formData.get(formReferrerFieldName); // move to query param?

  // @todo: real validation
  if (!formId || typeof formId !== 'string') {
    return jsonResponse({ error: 'Missing form id' }, 400); // @todo: localise error messages
  }

  // @todo: secure this endpoint with a Turnstile challenge

  const entry = await getEntry('Forms', formId);
  const form = entry?.data;

  if (!form) {
    return jsonResponse({ error: 'Form not found' }, 404);
  }

  const result = await handleFormSubmission(form.key, formData);
  console.log('Form submission result:', result);

  // todo: render in this endpoint or call an Astro Partial endpoint to render the form block on success:
  const successHtml = `<mark>Success!</mark> Form submitted with <br>ID: ${formId} <br>key: ${form.key}`;

  if (request.headers.get('Accept')?.includes('application/json')) {
    return jsonResponse({ html: successHtml });
  }

  if (!referrerPath || typeof referrerPath !== 'string') {
    return htmlResponse('<h1>Missing referrerPath</h1>', 400);
  }

  const referrerUrl = new URL(referrerPath, request.url);
  const referrerResponse = await fetch(referrerUrl);
  if (!referrerResponse.ok) {
    return htmlResponse('<h1>Invalid referrer URL</h1>', 400);
  }

  const referrerHtml = await referrerResponse.text();
  // hacky replacement to show success message
  const updatedHtml = referrerHtml
    .replace(/<form-block[^>]*>[\s\S]*?<\/form-block>/, 
      `<form-block>${successHtml}</form-block>`
    );

  return htmlResponse(updatedHtml, 200);
};
