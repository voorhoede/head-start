import { describe, expect, test } from 'vitest';
import { renderToFragment } from '~/lib/renderer';
import OpenInLlm, { type Props } from './OpenInLlm.astro';

const llmOptions: Props['llmOptions'] = [
  { __typename: 'ExternalLinkRecord', id: '1', title: 'Claude', url: 'https://claude.ai/new', openInNewTab: true, style: 'primary' },
  { __typename: 'ExternalLinkRecord', id: '2', title: 'ChatGPT', url: 'https://chatgpt.com/', openInNewTab: true, style: 'primary' },
];

describe('OpenInLlm', () => {
  test('offers to copy the page and to open its markdown version in the configured assistants', async () => {
    const fragment = await renderToFragment<Props>(OpenInLlm, {
      request: new Request('https://example.com/en/about/'),
      props: { llmOptions, prompt: 'Read { pageUrl } and explain it.' },
    });
    const markdownHref = 'https://example.com/api/content/en/about.md';
    const q = encodeURIComponent(`Read ${markdownHref} and explain it.`).replaceAll('%20', '+');

    expect(fragment.querySelector('button[data-copy-button] [data-icon="copy"]')).toBeTruthy();
    const toggle = fragment.querySelector('button[popovertarget]');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(fragment.querySelector(`ul[popover]#${toggle?.getAttribute('popovertarget')}`)).toBeTruthy();

    const links = Array.from(fragment.querySelectorAll<HTMLAnchorElement>('ul[popover] a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      markdownHref,
      `https://claude.ai/new?q=${q}`,
      `https://chatgpt.com/?q=${q}`,
    ]);
    // The markdown link stays on the site, the assistants open in a new tab
    expect(links[0].getAttribute('target')).toBeNull();
    expect(links[1].getAttribute('target')).toBe('_blank');
    expect(links[1].getAttribute('rel')).toBe('noopener noreferrer');
    // Menu items are text only, without an external link icon
    expect(fragment.querySelectorAll('ul[popover] [data-icon]').length).toBe(0);
  });

  test('uses the markdown URL as prompt when no prompt is configured', async () => {
    const fragment = await renderToFragment<Props>(OpenInLlm, {
      request: new Request('https://example.com/en/'),
      props: { llmOptions: llmOptions.slice(0, 1), prompt: '' },
    });

    const link = fragment.querySelector<HTMLAnchorElement>('ul[popover] li:nth-child(2) a');
    expect(new URL(link!.getAttribute('href')!).searchParams.get('q')).toBe('https://example.com/api/content/en.md');
  });
});
