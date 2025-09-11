import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

export async function turnstileChallenge(formData: FormData, requestHeaders: Request['headers']) {
  try {
    const token = formData.get('cf-turnstile-response') || '';
    const ip = requestHeaders.get('CF-Connecting-IP') || '';

    // Validate the token by calling the
    // "/siteverify" API endpoint.
    const body = new FormData();
    body.append('secret', TURNSTILE_SECRET_KEY);
    body.append('response', token);
    body.append('remoteip', ip);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
      body,
      method: 'POST',
    });
    
    const outcome = await result.json();
    if (outcome.success) {
      return true;
    }
    console.error('Turnstile challenge failed:', outcome['error-codes'].join(', '));
    return false;
  } catch (error) {
    console.error('Turnstile challenge failed:', error);
    return false; // Return false if any error occurs
  }
}
