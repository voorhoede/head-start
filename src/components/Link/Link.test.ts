import { describe, expect, test } from 'vitest';
import { renderToFragment } from '@lib/renderer';
import Link, { type Props as LinkProps } from './Link.astro';

const props = { 
  href: '#',
} satisfies LinkProps;

describe('Link', () => {
  test('Component is rendered', async () => {
    const fragment = await renderToFragment<LinkProps>(
      Link,
      { props }
    );
    expect(fragment).toBeDefined();
  });

  test('renders text content without trailing whitespace ', async () => {
    const fragment = await renderToFragment<LinkProps>(Link, {
      props,
      slots: {
        default: 'spacing\n',
      },
    });
    expect(fragment.querySelector('a')?.textContent).toBe('spacing');
  });
  
  test('sets target="_blank" when openInNewTab is present', async () => {
    const fragment = await renderToFragment<LinkProps>(Link, {
      props: {
        ...props,
        openInNewTab: true,
      },
      slots: {
        default: 'openInNewTab',
      },
    });
    expect(fragment.querySelector('a')?.target).toBe('_blank');
  });
  
  test('renders link as internal even when origin is explicit', async () => {
    const fragment = await renderToFragment<LinkProps>(Link, {
      props: {
        ...props,
        href: 'https://example.com/test',
        openInNewTab: true,
      },
      slots: {
        default: 'Internal link with protocol',
      },
      request: new Request('https://example.com'),
    });
    
    const rel = fragment.querySelector('a')?.getAttribute('rel');
    expect(rel).toBeNull();
  });
  
  test('sets rel="noopener noreferrer" when external link', async () => {
    const fragment = await renderToFragment<LinkProps>(Link, {
      props: {
        ...props,
        href: 'https://example.net',
        openInNewTab: true,
      },
      slots: {
        default: 'External link',
      },
      request: new Request('https://example.com'),
    });
    
    const rel = fragment.querySelector('a')?.getAttribute('rel')?.split(' ');
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });
});
