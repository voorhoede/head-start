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

  it('renders a select field with options', async () => {
    const frag = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });
    const select = frag.querySelector('select[name="subject"]');
    expect(select).toBeTruthy();
    const optionValues = [...select!.querySelectorAll('option')].map((o) => o.getAttribute('value'));
    expect(optionValues).toContain('sales');
    expect(optionValues).toContain('support');
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
    expect(text).not.toMatch(/".*"/);
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
  it('returns 400 with rendered form when validation fails', async () => {
    const { getEntry } = await import('~/lib/content');
    const { validateSubmission } = await import('~/lib/forms');

    vi.mocked(getEntry).mockResolvedValue(mockEntry);
    vi.mocked(validateSubmission).mockResolvedValue({
      success: false,
      values: { email: 'wrong' },
      errors: { email: 'Invalid email' },
    });

    const form = new FormData();
    form.set('email', 'wrong');

    const request = new Request('http://localhost/api/forms/contact/', {
      method: 'POST',
      body: form,
      headers: {
        referer: 'http://localhost/contact',
        'x-requested-by': 'client',
      },
    });

    // @TODO Add actual integration test with a local build
    const res = await POST({ params: { slug: 'contact' }, request } as unknown as APIContext);

    expect(res).toBeInstanceOf(Response);
    const response = res as Response;
    expect(response.status).toBe(400);
    const html = await response.text();
    expect(html).toContain('<form');
    expect(html).toContain('form-field__error');
  });

  it('returns action HTML when validation succeeds', async () => {
    const { getEntry } = await import('~/lib/content');
    const { validateSubmission } = await import('~/lib/forms');

    vi.mocked(getEntry).mockResolvedValue(mockEntry);
    vi.mocked(validateSubmission).mockResolvedValue({
      success: true,
      values: { email: 'john@example.com' },
      errors: {},
    });

    const form = new FormData();
    form.set('email', 'john@example.com');

    const request = new Request('http://localhost/api/forms/contact/', {
      method: 'POST',
      body: form,
      headers: { referer: 'http://localhost/contact' },
    });

    // @TODO Add actual integration test with a local build
    const result = await POST({ params: { slug: 'contact' }, request } as unknown as APIContext);

    expect(result instanceof Response).toBe(true);
    const html = await (result as Response).text();
    expect(html).toMatch(/Success/i);
  });
});
