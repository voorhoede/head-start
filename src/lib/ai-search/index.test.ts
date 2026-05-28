import { describe, expect, test } from 'vitest';
import { getAskPathname } from '~/lib/ai-search';

describe('ai-search', () => {
  test('"getAskPathname" should return correct ask pathname for a specific locale', () => {
    expect(getAskPathname('en')).toBe('/en/ask/');
    expect(getAskPathname('nl')).toBe('/nl/ask/');
  });
});
