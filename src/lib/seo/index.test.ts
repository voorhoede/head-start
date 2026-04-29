import { afterEach, describe, test, expect, vi } from 'vitest';
import robotsParser from 'robots-parser';
import { llmsTxt, robotsTxt, siteName, titleSuffix, titleTag } from '~/lib/seo';
import { getLocale } from '~/lib/i18n';
import aiRobotsTxt from './ai.robots.txt?raw';

vi.mock('~/lib/i18n', () => ({
  getLocale: vi.fn(),
}));

vi.mock('~/lib/site.json', () => ({
  globalSeo: {
    en: {
      siteName: 'Test Site (English)',
      titleSuffix: '| English Site',
    },
    nl: {
      siteName: 'Test Site (Dutch)',
      titleSuffix: '| Nederlandse Site',
    },
  },
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('seo', () => {
  test('siteName is correctly set for different locales', () => {
    vi.mocked(getLocale).mockReturnValue('en');
    expect(siteName()).toBe('Test Site (English)');

    vi.mocked(getLocale).mockReturnValue('nl');
    expect(siteName()).toBe('Test Site (Dutch)');
  });

  test('titleSuffix is correctly set for different locales', () => {
    vi.mocked(getLocale).mockReturnValue('en');
    expect(titleSuffix()).toBe('| English Site');

    vi.mocked(getLocale).mockReturnValue('nl');
    expect(titleSuffix()).toBe('| Nederlandse Site');
  });

  test('titleTag generates correct title for different locales', () => {
    vi.mocked(getLocale).mockReturnValue('en');
    expect(titleTag('Test Page')).toEqual({
      tag: 'title',
      content: 'Test Page | English Site',
    });

    vi.mocked(getLocale).mockReturnValue('nl');
    expect(titleTag('Testpagina')).toEqual({
      tag: 'title',
      content: 'Testpagina | Nederlandse Site',
    });
  });

  test('ai.robots.txt contains only list of disallowed user agents', async () => {
    // note: useful to test as file is downloaded from a 3rd party source (and could change)
    const [agentsText, disallowText] = aiRobotsTxt.trim().split('Disallow:').map((s) => s.trim());
    expect(disallowText).toBe('/');
    const agentLines = agentsText.split('\n');
    agentLines.map((line) => {
      expect(line).toMatch(/^User-agent: /);
    });
    const robots = robotsParser('', aiRobotsTxt);
    expect(robots.isAllowed('/', 'GPTBot')).toBe(false); // fair to assume is listed in the file
  });

  test('robots.txt disallows AI bots when allowAiBots is false', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = false;
    const allowAll = true;
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, siteUrl }));
    expect(robots.isAllowed('/', 'GPTBot')).toBe(false);
  });

  test('robots.txt allows AI bots when allowAiBots & allowAll is true', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true;
    const allowAll = true;
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, siteUrl }));
    expect(robots.isAllowed('/', 'GPTBot')).toBe(true);
  });

  test('robots.txt disallows AI Bots when allowAiBots is true, while allowAll is false', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true;
    const allowAll = false;
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, siteUrl }));
    expect(robots.isAllowed('/', 'GPTBot')).toBe(false);
  });

  test('robots.txt allows all bots when allowAll is true', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true; // irrelevant for this test, but required
    const allowAll = true;
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, siteUrl }));
    expect(robots.isAllowed('/', 'HeadStartExampleBot')).toBe(true);
  });

  test('robots.txt disallows any bots when allowAll is false', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true; // irrelevant for this test, but required
    const allowAll = false;
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, siteUrl }));
    expect(robots.isAllowed('/', 'HeadStartExampleBot')).toBe(false);
  });

  test('robots.txt links to the sitemap index on the given site url', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true; // irrelevant for this test, but required
    const allowAll = true;    // irrelevant for this test, but required
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, siteUrl }));
    expect(robots.getSitemaps()).toEqual([`${siteUrl}/sitemap-index.xml`]);
  });

  test('llmsTxt renders H1, blockquote, intro and Pages section when AI bots are allowed', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      intro: 'IMPORTANT: be nice.',
      allowAiBots: true,
      pages: [
        { title: 'Home', url: '/en/' },
        { title: 'About', url: '/en/about/', description: 'Who we are.' },
      ],
      siteUrl: 'https://example.com',
    });
    expect(result).toBe([
      '# Acme',
      '',
      '> A short site description.',
      '',
      'IMPORTANT: be nice.',
      '',
      '## Pages',
      '',
      '- [Home](https://example.com/en/)',
      '- [About](https://example.com/en/about/): Who we are.',
    ].join('\n'));
  });

  test('llmsTxt omits the Pages section when AI bots are disallowed', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      intro: 'IMPORTANT: do not scrape.',
      allowAiBots: false,
      pages: [{ title: 'Home', url: '/en/' }],
      siteUrl: 'https://example.com',
    });
    expect(result).toBe([
      '# Acme',
      '',
      '> A short site description.',
      '',
      'IMPORTANT: do not scrape.',
    ].join('\n'));
    expect(result).not.toContain('## Pages');
  });

  test('llmsTxt omits the Pages section when allowed but pages is empty', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      intro: 'IMPORTANT: be nice.',
      allowAiBots: true,
      pages: [],
      siteUrl: 'https://example.com',
    });
    expect(result).not.toContain('## Pages');
  });

  test('llmsTxt omits the intro paragraph when intro is empty', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      intro: '',
      allowAiBots: true,
      pages: [{ title: 'Home', url: '/en/' }],
      siteUrl: 'https://example.com',
    });
    expect(result).toBe([
      '# Acme',
      '',
      '> A short site description.',
      '',
      '## Pages',
      '',
      '- [Home](https://example.com/en/)',
    ].join('\n'));
  });

  test('llmsTxt omits the blockquote summary when siteSummary is empty', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: '',
      intro: 'IMPORTANT: be nice.',
      allowAiBots: true,
      pages: [],
      siteUrl: 'https://example.com',
    });
    expect(result).toBe([
      '# Acme',
      '',
      'IMPORTANT: be nice.',
    ].join('\n'));
    expect(result).not.toContain('>');
  });

  test('llmsTxt renders descriptions only when present on a page', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: '',
      intro: '',
      allowAiBots: true,
      pages: [
        { title: 'Home', url: '/en/' },
        { title: 'About', url: '/en/about/', description: 'Who we are.' },
      ],
      siteUrl: 'https://example.com',
    });
    expect(result).toContain('- [Home](https://example.com/en/)\n');
    expect(result).toContain('- [About](https://example.com/en/about/): Who we are.');
    expect(result).not.toContain('- [Home](https://example.com/en/):');
  });

});
