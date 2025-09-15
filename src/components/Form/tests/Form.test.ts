import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToFragment } from '@lib/renderer';
import { FormNotFound, FormSuccess, Form } from '@components/Form';
import type { CollectionEntry } from '@lib/content';
import type { SiteLocale } from '@lib/datocms/types.ts';
import { POST } from '@pages/api/forms/[slug]';

const locale = 'en' as SiteLocale;
const formFields = [
  { id: '1', label: 'Name', name: 'name', required: true, fieldType: 'text', placeholder: 'Name' },
  { id: '2', label: 'Email', name: 'email', required: true, fieldType: 'email', placeholder: 'you@example.com' },
  { id: '3', label: 'Phone', name: 'phone', required: false, fieldType: 'tel', placeholder: '+123...' },
  { id: '4', label: 'Message', name: 'message', required: false, fieldType: 'textarea', placeholder: 'Say hi' },
];

const mockEntry = {
  id: 'en/contact',
  collection: 'Forms',
  data: {
    title: 'Contact',
    id: 'en/contact',
    slug: 'contact',
    formFields,
    meta: { recordId: '0', locale },
    subscription: { variables: { slug: 'contact', locale } }
  },
} as CollectionEntry<'Forms'>;

describe('Form.astro', () => {
  it('renders a POST form with the correct action', async () => {
    const frag = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });
    const formEl = frag.querySelector('form');
    expect(formEl).toBeTruthy();
    expect(formEl?.getAttribute('method')).toBe('POST');
    expect(formEl?.getAttribute('action')).toBe('/api/forms/contact/');
  });

  it('renders all fields with labels', async () => {
    const frag = await renderToFragment(Form, { props: { ...mockEntry.data, useTurnStile: false } });
    const fields = frag.querySelectorAll('.form-field');
    expect(fields.length).toBe(formFields.length);
    // Ensure labels exist with required asterisk for required fields
    formFields.forEach(({ id, label, required }) => {
      const labelEl = frag.querySelector(`label[for="${id}"]`);
      expect(labelEl?.textContent).toContain(label);
      if (required) {
        expect(labelEl?.textContent).toContain('*');
      }
    });
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
    // In JSDOM, the current value of a textarea is exposed via the `.value` property
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
    expect(text).not.toMatch(/".*"/);
  });

  it('renders the slug when provided', async () => {
    const frag = await renderToFragment(FormNotFound, { props: { slug: 'contact' } });
    const text = frag.textContent?.replace(/\s+/g, ' ').trim();
    expect(text).toContain('Form');
    expect(text).toContain('"$contact"');
    expect(text).toContain('not found');
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('POST /api/forms/[slug]', () => {
  it('returns 400 with rendered form when validation fails', async () => {
    const { getEntry } = await import('@lib/content');
    const { validateSubmission } = await import('@lib/forms');

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
    const res = await POST({ params: { slug: 'contact' }, request });

    // Should return a Response with 400
    expect(res).toBeInstanceOf(Response);
    const response = res as Response;
    expect(response.status).toBe(400);
    const html = await response.text();
    expect(html).toContain('<form');
    expect(html).toContain('form-field__error');
  });

  it('returns action HTML when validation succeeds', async () => {
    const { getEntry } = await import('@lib/content');
    const { validateSubmission } = await import('@lib/forms');

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
    const result = await POST({ params: { slug: 'contact' }, request });
    
    expect(result instanceof Response).toBe(true);
    const html = await (result as Response).text();
    expect(html).toMatch(/Success/i);
  });

});
