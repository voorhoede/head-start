import { afterEach, describe, test, expect, vi } from 'vitest';
import robotsParser from 'robots-parser';
import { agentsIndex, llmsTxt, robotsTxt, siteName, titleSuffix, titleTag } from '~/lib/seo';
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
    const aiContentPolicy = 'disallow-all';
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, aiContentPolicy, siteUrl }));
    expect(robots.isAllowed('/', 'GPTBot')).toBe(false);
  });

  test('robots.txt allows AI bots when allowAiBots & allowAll is true', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true;
    const allowAll = true;
    const aiContentPolicy = 'disallow-all';
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, aiContentPolicy, siteUrl }));
    expect(robots.isAllowed('/', 'GPTBot')).toBe(true);
  });

  test('robots.txt disallows AI Bots when allowAiBots is true, while allowAll is false', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true;
    const allowAll = false;
    const aiContentPolicy = 'disallow-all';
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, aiContentPolicy, siteUrl }));
    expect(robots.isAllowed('/', 'GPTBot')).toBe(false);
  });

  test('robots.txt allows all bots when allowAll is true', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true; // irrelevant for this test, but required
    const allowAll = true;
    const aiContentPolicy = 'disallow-all';
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, aiContentPolicy, siteUrl }));
    expect(robots.isAllowed('/', 'HeadStartExampleBot')).toBe(true);
  });

  test('robots.txt disallows any bots when allowAll is false', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true; // irrelevant for this test, but required
    const allowAll = false;
    const aiContentPolicy = 'disallow-all';
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, aiContentPolicy, siteUrl }));
    expect(robots.isAllowed('/', 'HeadStartExampleBot')).toBe(false);
  });

  test('robots.txt links to the sitemap index on the given site url', () => {
    const siteUrl = 'https://example.com';
    const allowAiBots = true; // irrelevant for this test, but required
    const allowAll = true;    // irrelevant for this test, but required
    const aiContentPolicy = 'disallow-all';
    const robots = robotsParser('', robotsTxt({ allowAiBots, allowAll, aiContentPolicy, siteUrl }));
    expect(robots.getSitemaps()).toEqual([`${siteUrl}/sitemap-index.xml`]);
  });

  test('robots.txt declares a Content-Signal in the User-agent: * block', () => {
    const result = robotsTxt({ allowAiBots: true, allowAll: true, aiContentPolicy: 'search-only', siteUrl: 'https://example.com' });
    const userAgentBlock = result.slice(result.indexOf('User-agent: *'));
    expect(userAgentBlock).toMatch(/^Content-Signal: .+$/m);
  });

  test('robots.txt Content-Signal grants all uses for the `search-ai-input-ai-training` policy when indexing is allowed', () => {
    const result = robotsTxt({ allowAiBots: true, allowAll: true, aiContentPolicy: 'search-ai-input-ai-training', siteUrl: 'https://example.com' });
    expect(result).toContain('Content-Signal: ai-train=yes, search=yes, ai-input=yes');
  });

  test('robots.txt Content-Signal grants search only for the `search-only` policy', () => {
    const result = robotsTxt({ allowAiBots: true, allowAll: true, aiContentPolicy: 'search-only', siteUrl: 'https://example.com' });
    expect(result).toContain('Content-Signal: ai-train=no, search=yes, ai-input=no');
  });

  test('robots.txt Content-Signal grants search and AI input but not training for the `search-ai-input` policy', () => {
    const result = robotsTxt({ allowAiBots: true, allowAll: true, aiContentPolicy: 'search-ai-input', siteUrl: 'https://example.com' });
    expect(result).toContain('Content-Signal: ai-train=no, search=yes, ai-input=yes');
  });

  test('robots.txt Content-Signal denies all uses for the `disallow-all` policy', () => {
    const result = robotsTxt({ allowAiBots: true, allowAll: true, aiContentPolicy: 'disallow-all', siteUrl: 'https://example.com' });
    expect(result).toContain('Content-Signal: ai-train=no, search=no, ai-input=no');
  });

  test('robots.txt Content-Signal denies all uses for an unknown policy', () => {
    const result = robotsTxt({ allowAiBots: true, allowAll: true, aiContentPolicy: 'something-else', siteUrl: 'https://example.com' });
    expect(result).toContain('Content-Signal: ai-train=no, search=no, ai-input=no');
  });

  test('robots.txt Content-Signal denies AI uses but keeps search when allowAiBots is false', () => {
    const result = robotsTxt({ allowAiBots: false, allowAll: true, aiContentPolicy: 'search-ai-input-ai-training', siteUrl: 'https://example.com' });
    expect(result).toContain('Content-Signal: ai-train=no, search=yes, ai-input=no');
  });

  test('robots.txt Content-Signal denies all uses when indexing is disallowed, regardless of policy', () => {
    const result = robotsTxt({ allowAiBots: true, allowAll: false, aiContentPolicy: 'search-ai-input-ai-training', siteUrl: 'https://example.com' });
    expect(result).toContain('Content-Signal: ai-train=no, search=no, ai-input=no');
  });

  test('llmsTxt renders H1, blockquote, intro and Pages section when AI bots are allowed', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      intro: 'IMPORTANT: be nice.',
      allowAiBots: true,
      items: [
        { title: 'Home', url: 'https://example.com/en/' },
        { title: 'About', url: 'https://example.com/en/about/', description: 'Who we are.' },
      ],
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
      items: [{ title: 'Home', url: 'https://example.com/en/' }],
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

  test('llmsTxt omits the Pages section when allowed but items is empty', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      intro: 'IMPORTANT: be nice.',
      allowAiBots: true,
      items: [],
    });
    expect(result).not.toContain('## Pages');
  });

  test('llmsTxt omits the intro paragraph when intro is empty', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      intro: '',
      allowAiBots: true,
      items: [{ title: 'Home', url: 'https://example.com/en/' }],
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
      items: [],
    });
    expect(result).toBe([
      '# Acme',
      '',
      'IMPORTANT: be nice.',
    ].join('\n'));
    expect(result).not.toContain('>');
  });

  test('llmsTxt renders descriptions only when present on an item', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: '',
      intro: '',
      allowAiBots: true,
      items: [
        { title: 'Home', url: 'https://example.com/en/' },
        { title: 'About', url: 'https://example.com/en/about/', description: 'Who we are.' },
      ],
    });
    expect(result).toContain('- [Home](https://example.com/en/)\n');
    expect(result).toContain('- [About](https://example.com/en/about/): Who we are.');
    expect(result).not.toContain('- [Home](https://example.com/en/):');
  });

  test('llmsTxt interpolates {{ siteName }} in the intro', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: '',
      intro: 'According to {{ siteName }}, the sky is blue. Thanks {{siteName}}!',
      allowAiBots: true,
      items: [],
    });
    expect(result).toContain('According to Acme, the sky is blue. Thanks Acme!');
    expect(result).not.toContain('{{');
  });

  test('llmsTxt promotes top-level groups to their own H2 sections', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: '',
      intro: '',
      allowAiBots: true,
      items: [
        { title: 'Home', url: 'https://example.com/en/' },
        {
          title: 'Resources',
          children: [
            { title: 'Docs', url: 'https://example.com/en/docs/' },
            { title: 'Blog', url: 'https://example.com/en/blog/' },
          ],
        },
        { title: 'Contact', url: 'https://example.com/en/contact/' },
      ],
    });
    expect(result).toBe([
      '# Acme',
      '',
      '## Pages',
      '',
      '- [Home](https://example.com/en/)',
      '- [Contact](https://example.com/en/contact/)',
      '',
      '## Resources',
      '',
      '- [Docs](https://example.com/en/docs/)',
      '- [Blog](https://example.com/en/blog/)',
    ].join('\n'));
  });

  test('llmsTxt omits the Pages section when only groups are present', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: '',
      intro: '',
      allowAiBots: true,
      items: [
        {
          title: 'Resources',
          children: [{ title: 'Docs', url: 'https://example.com/en/docs/' }],
        },
      ],
    });
    expect(result).toBe([
      '# Acme',
      '',
      '## Resources',
      '',
      '- [Docs](https://example.com/en/docs/)',
    ].join('\n'));
    expect(result).not.toContain('## Pages');
  });

  test('llmsTxt renders nested groups inside an H2 section as text-only with indent', () => {
    const result = llmsTxt({
      siteName: 'Acme',
      siteSummary: '',
      intro: '',
      allowAiBots: true,
      items: [
        {
          title: 'Top',
          children: [
            {
              title: 'Mid',
              children: [
                { title: 'Leaf', url: 'https://example.com/leaf/' },
              ],
            },
          ],
        },
      ],
    });
    expect(result).toContain('## Top\n\n- Mid\n  - [Leaf](https://example.com/leaf/)');
  });

  test('agentsIndex builds a registry with an empty agents list by default', () => {
    const result = agentsIndex({
      siteName: 'Acme',
      siteSummary: 'A short site description.',
      siteUrl: 'https://example.com',
    });
    expect(result).toEqual({
      version: '0.1',
      name: 'Acme',
      description: 'A short site description.',
      url: 'https://example.com',
      agents: [],
    });
  });

  test('agentsIndex includes provided agents', () => {
    const agents = [
      {
        name: 'Site search',
        description: 'Search this site’s content',
        url: 'https://example.com/api/search',
        agentCard: '/.well-known/agent-card.json',
      },
    ];
    const result = agentsIndex({
      siteName: 'Acme',
      siteSummary: '',
      siteUrl: 'https://example.com',
      agents,
    });
    expect(result.agents).toEqual(agents);
  });

});
