import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToFragment } from '~/lib/renderer';
import { FormNotFound, FormSuccess, Form } from '~/components/Form';
import type { CollectionEntry } from '~/lib/content';
import type { SiteLocale } from '~/lib/datocms/schema';
import type { APIContext } from 'astro';
import { POST } from '~/pages/api/forms/[slug]';

vi.mock('~/lib/content');
vi.mock('~/lib/forms');

const locale = 'en' as SiteLocale;

// Shared options used for both checkbox and radio group fields
const groupOptions = [{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }];

const formFields = [
  { id: '1', label: 'Name',      name: 'name',      required: true,  fieldType: 'text',     placeholder: 'Name',            options: [],          inputWidth: null },
  { id: '2', label: 'Email',     name: 'email',     required: true,  fieldType: 'email',    placeholder: 'you@example.com', options: [],          inputWidth: null },
  { id: '3', label: 'Phone',     name: 'phone',     required: false, fieldType: 'phone',    placeholder: '+123...',         options: [],          inputWidth: null },
  { id: '4', label: 'Message',   name: 'message',   required: false, fieldType: 'textarea', placeholder: 'Say hi',          options: [],          inputWidth: null },
  { id: '5', label: 'Subject',   name: 'subject',   required: true,  fieldType: 'select',   placeholder: '',                options: [{ label: 'Sales', value: 'sales' }, { label: 'Support', value: 'support' }], inputWidth: null },
  { id: '6', label: 'Age',       name: 'age',       required: false, fieldType: 'number',   placeholder: '25',              options: [],          inputWidth: null },
  { id: '7', label: 'Birthday',  name: 'birthday',  required: false, fieldType: 'date',     placeholder: '',                options: [],          inputWidth: null },
  { id: '8', label: 'Interests', name: 'interests', required: false, fieldType: 'checkbox', placeholder: '',                options: groupOptions, inputWidth: null },
  { id: '9', label: 'Role',      name: 'role',      required: true,  fieldType: 'radio',    placeholder: '',                options: groupOptions, inputWidth: null },
];

const mockEntry = {
  id: 'en/contact',
  collection: 'Forms',
  data: {
    title: 'Contact',
    id: 'en/contact',
    slug: 'contact',
    submitLabel: null,
    formFields,
    meta: { recordId: '0', locale },
    subscription: { variables: { slug: 'contact', locale } }
  },
} as CollectionEntry<'Forms'>;

// checkbox/radio with options renders a <fieldset><legend> instead of <label for>
const isGroup = (f: typeof formFields[number]) =>
  (f.fieldType === 'checkbox' || f.fieldType === 'radio') && f.options.length > 0;

describe('Form.astro', () => {
  it('renders a POST form with the correct action', async () => {
    const frag = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });
    const formEl = frag.querySelector('form');
    expect(formEl).toBeTruthy();
    expect(formEl?.getAttribute('method')).toBe('POST');
    expect(formEl?.getAttribute('action')).toBe('/api/forms/contact/');
  });

  it('renders all fields with their labels', async () => {
    const frag = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });
    expect(frag.querySelectorAll('.form-field').length).toBe(formFields.length);

    for (const field of formFields) {
      if (isGroup(field)) {
        // Groups expose their label via <legend> inside a <fieldset>
        const legend = frag.querySelector(`.form-field--${field.fieldType} legend`);
        expect(legend?.textContent).toContain(field.label);
        if (field.required) expect(legend?.textContent).toContain('*');
      } else {
        const labelEl = frag.querySelector(`label[for="${field.id}"]`);
        expect(labelEl?.textContent).toContain(field.label);
        if (field.required) expect(labelEl?.textContent).toContain('*');
      }
    }
  });

  it('renders the correct HTML input type for each field type', async () => {
    const frag = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });

    const cases: [string, string][] = [
      ['name',      'input[type="text"][name="name"]'],
      ['email',     'input[type="email"][name="email"]'],
      ['phone',     'input[type="tel"][name="phone"]'],
      ['age',       'input[type="number"][name="age"]'],
      ['birthday',  'input[type="date"][name="birthday"]'],
      ['message',   'textarea[name="message"]'],
      ['subject',   'select[name="subject"]'],
      ['interests', 'input[type="checkbox"][name="interests"]'],
      ['role',      'input[type="radio"][name="role"]'],
    ];

    for (const [fieldName, selector] of cases) {
      expect(frag.querySelector(selector), `${fieldName}: expected ${selector}`).toBeTruthy();
    }
  });

  it('checkbox and radio groups use fieldset + legend for semantic grouping', async () => {
    const frag = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });

    for (const fieldType of ['checkbox', 'radio'] as const) {
      const fieldset = frag.querySelector(`.form-field--${fieldType}`);
      expect(fieldset?.tagName.toLowerCase(), `${fieldType} group should be a <fieldset>`).toBe('fieldset');

      const legend = fieldset?.querySelector('legend');
      expect(legend, `${fieldType} group needs a <legend>`).toBeTruthy();

      // Each option must have its own label wrapping the input
      const labels = fieldset?.querySelectorAll('label');
      expect(labels?.length, `${fieldType} group should have ${groupOptions.length} labels`).toBe(groupOptions.length);
    }
  });

  it('shows errors and preserves values when provided', async () => {
    const errors = { email: 'Invalid email' };
    const formValues = { name: 'Alice', email: 'wrong', message: 'Hello World!' };
    const fragment = await renderToFragment(Form, { props: { ...mockEntry.data, errors, formValues, useTurnStile: false } });

    // Error class and message
    const errorField = fragment.querySelector('.form-field--error');
    expect(errorField).toBeTruthy();
    expect(errorField?.querySelector('.form-field__error')?.textContent).toContain('Invalid email');

    // Values preserved on inputs/textarea
    const nameInput = fragment.querySelector('input[name="name"]') as HTMLInputElement | null;
    const emailInput = fragment.querySelector('input[type="email"][name="email"]') as HTMLInputElement | null;
    const messageTextarea = fragment.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null;
    expect(nameInput?.getAttribute('value')).toBe('Alice');
    expect(emailInput?.getAttribute('value')).toBe('wrong');
    // JSDOM exposes textarea content via .value, not an attribute
    expect(messageTextarea?.value).toBe('Hello World!');
  });

  it('includes Turnstile markup by default and can be disabled', async () => {
    const withTurnstile = await renderToFragment(Form, { props: { ...mockEntry.data } });
    expect(withTurnstile.querySelector('.cf-turnstile')).toBeTruthy();

    const withoutTurnstile = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });
    expect(withoutTurnstile.querySelector('.cf-turnstile')).toBeFalsy();
  });
});

describe('FormSuccess.astro', () => {
  it('renders a success message', async () => {
    const frag = await renderToFragment(FormSuccess);
    const text = frag.textContent?.replace(/\s+/g, ' ').trim();
    expect(text).toContain('Success');
    expect(text).toContain('form has been submitted');
  });
});

describe('FormNotFound.astro', () => {
  it('renders generic not found message when no slug provided', async () => {
    const frag = await renderToFragment(FormNotFound);
    const text = frag.textContent?.replace(/\s+/g, ' ').trim();
    expect(text).toContain('Form');
    expect(text).toContain('not found');
  });

  it('renders the slug when provided', async () => {
    const frag = await renderToFragment(FormNotFound, { props: { slug: 'contact' } });
    const text = frag.textContent?.replace(/\s+/g, ' ').trim();
    expect(text).toContain('Form');
    expect(text).toContain('"contact"');
    expect(text).toContain('not found');
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('POST /api/forms/[slug]', () => {
  type ValidationResult = { success: boolean; values: Record<string, string>; errors: Record<string, string> };

  // Mocks the form lookup + validation outcome and POSTs to the endpoint.
  // Pass an Error as `validation` to simulate a server-side crash during validation.
  // Pass `client: true` to simulate a JS-driven submit (x-requested-by header).
  async function submit(
    { fields, validation, client = false }:
    { fields: Record<string, string>; validation: ValidationResult | Error; client?: boolean },
  ) {
    const { getEntry } = await import('~/lib/content');
    const { validateSubmission } = await import('~/lib/forms');

    vi.mocked(getEntry).mockResolvedValue(mockEntry);
    if (validation instanceof Error) {
      vi.mocked(validateSubmission).mockRejectedValue(validation);
    } else {
      vi.mocked(validateSubmission).mockResolvedValue(validation);
    }

    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) form.set(key, value);

    const headers: Record<string, string> = { referer: 'http://localhost/contact' };
    if (client) headers['x-requested-by'] = 'client';

    const request = new Request('http://localhost/api/forms/contact/', { method: 'POST', body: form, headers });

    // @TODO Add actual integration test with a local build
    const res = await POST({ params: { slug: 'contact' }, request } as unknown as APIContext);
    expect(res).toBeInstanceOf(Response);
    return res as Response;
  }

  const invalid: ValidationResult = { success: false, values: { email: 'wrong' }, errors: { email: 'Invalid email' } };

  it('shows inline validation errors on the re-rendered form when validation fails', async () => {
    const response = await submit({ fields: { email: 'wrong' }, validation: invalid });

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('<form');
    expect(html).toContain('form-field__error');
    expect(html).toContain('Invalid email');
  });

  it('returns validation errors as JSON so the client can render them inline', async () => {
    const response = await submit({ fields: { email: 'wrong' }, validation: invalid, client: true });

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const data = await response.json() as { errors: Record<string, string> };
    expect(data.errors.email).toBe('Invalid email');
  });

  it('shows the success view when the form is submitted correctly', async () => {
    const response = await submit({
      fields: { email: 'john@example.com' },
      validation: { success: true, values: { email: 'john@example.com' }, errors: {} },
    });

    const html = await response.text();
    expect(html).toMatch(/Success/i);
  });

  it('shows the error page when the form action errors server-side', async () => {
    const response = await submit({ fields: { email: 'john@example.com' }, validation: new Error('boom') });

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('data-form-back');
  });
});
