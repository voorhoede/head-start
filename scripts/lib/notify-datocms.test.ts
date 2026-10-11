import { describe, expect, test } from 'vitest';
import { findMatchingTrigger } from './notify-datocms.ts';

const production = {
  webhook_url: 'https://webhooks.datocms.com/production/deploy-results',
  adapter_settings: { payload: { branch: 'main' } },
};
const preview = {
  webhook_url: 'https://webhooks.datocms.com/preview/deploy-results',
  adapter_settings: { payload: { branch: 'main', env: 'preview' } },
};
const localhost = {
  webhook_url: 'https://webhooks.datocms.com/localhost/deploy-results',
  adapter_settings: null,
};
const triggers = [localhost, preview, production];

describe('findMatchingTrigger', () => {
  test('matches the production trigger on branch without an env', () => {
    expect(findMatchingTrigger(triggers, { branch: 'main' })).toBe(production);
    expect(findMatchingTrigger(triggers, { branch: 'main', env: undefined })).toBe(production);
  });

  test('matches the preview trigger on branch and env', () => {
    expect(findMatchingTrigger(triggers, { branch: 'main', env: 'preview' })).toBe(preview);
  });

  test('returns undefined for an unknown branch or env', () => {
    expect(findMatchingTrigger(triggers, { branch: 'feature' })).toBeUndefined();
    expect(findMatchingTrigger(triggers, { branch: 'main', env: 'staging' })).toBeUndefined();
    expect(findMatchingTrigger(triggers, { branch: undefined })).toBeUndefined();
  });
});
