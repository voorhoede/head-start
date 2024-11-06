import { afterEach, describe, expect, test, vi } from 'vitest';
import { formatSearchResults, type RawSearchResult } from '@lib/datocms';

vi.mock('../../../../datocms-environment', () => ({
  datocmsBuildTriggerId: 'mock-build-trigger-id',
  datocmsEnvironment: 'mock-environment',
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('formatSearchResults:', () => {
  test('should format search results with highlights', () => {
    const query = 'Test';
    const results: RawSearchResult[] = [
      {
        type: 'search_result',
        id: '1',
        attributes: {
          title: 'Test Title',
          body_excerpt: 'This is a test body excerpt.',
          url: 'https://example.com',
          score: 1,
          highlight: {
            title: ['Test [h]Title[/h]'],
            body: ['This is a [h]test[/h] body excerpt.'],
          },
        },
      },
    ];

    const formattedResults = formatSearchResults({ query, results });

    expect(formattedResults).toHaveLength(1);
    expect(formattedResults[0].title).toBe('Test Title');
    expect(formattedResults[0].matches[0].markedText).toBe('This is a <mark>test</mark> body excerpt.');
    expect(formattedResults[0].textFragmentUrl).toBe('https://example.com#:~:text=test');
  });

  test('should handle results without highlights', () => {
    const query = 'Test';
    const results: RawSearchResult[] = [
      {
        type: 'search_result',
        id: '2',
        attributes: {
          title: 'Another Title',
          body_excerpt: 'No highlights here.',
          url: 'https://example.com/2',
          score: 0.5,
          highlight: {
            title: null,
            body: null,
          },
        },
      },
    ];

    const formattedResults = formatSearchResults({ query, results });

    expect(formattedResults).toHaveLength(1);
    expect(formattedResults[0].title).toBe('Another Title');
    expect(formattedResults[0].matches[0].markedText).toBe('No highlights here.');
    expect(formattedResults[0].textFragmentUrl).toBe('https://example.com/2#:~:');
  });
});
