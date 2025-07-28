import type { FormKey } from './types';
import { newsletterSignup } from './newsletterSignup';

export const formBlockCustomElementName = 'form-block';
export const formReferrerFieldName = 'referrer';

// todo: create a registerFormHandler function that can be called from outside lib/
const formHandlers: Record<FormKey, (formData: FormData) => Promise<void>> = {
  'newsletter-signup': newsletterSignup,
  // Add other form handlers here as needed
};

export const handleFormSubmission = async (formKey: FormKey, formData: FormData) => {
  const handler = formHandlers[formKey];
  if (!handler) {
    throw new Error(`No handler found for form key: ${formKey}`);
  }
  return handler(formData);
};

// todo: add form protection with Turnstile challenge
// export default async function turnstileChallenge(formData: FormData, requestHeaders: Request['headers']) {
//   // borrow from other project
// }
