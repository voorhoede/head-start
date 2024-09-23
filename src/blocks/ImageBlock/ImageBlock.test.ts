import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import ImageBlock, { type Props } from './ImageBlock.astro';

describe('ImageBlock', () => {
  test('renders the image with the correct source, alt text, and loading attribute', async () => {
    const fragment = await renderToFragment<Props>(ImageBlock, {
      props: {
        block: {
          id: '123',
          image: {
            url: 'https://example.com/test.jpg',
            alt: 'A test image',
            title: 'A test image',
            height: 150,
            width: 150
          }
        }
      },
    });

    const img = fragment.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.src).toBe('https://example.com/test.jpg');
    expect(img?.alt).toBe('A test image');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  test('renders the correct aspect ratio style', async () => {
    const fragment = await renderToFragment<Props>(ImageBlock, {
      props: {
        block: {
          id: '123',
          image: {
            url: 'https://example.com/test.jpg',
            alt: 'A test image',
            height: 150,
            width: 150
          }
        }
      },
    });

    const img = fragment.querySelector('img');
    expect(img?.style.aspectRatio).toBe('150/150');
  });

  test('renders with a figcaption when title is provided', async () => {
    const fragment = await renderToFragment<Props>(ImageBlock, {
      props: {
        block: {
          id: '123',
          image: {
            url: 'https://example.com/test.jpg',
            alt: 'A test image',
            title: 'A test image',
            height: 150,
            width: 150
          }
        }
      },
    });

    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('figcaption')?.textContent).toBe('A test image');
  });

  test('does not render figcaption when no title is provided', async () => {
    const fragment = await renderToFragment<Props>(ImageBlock, {
      props: {
        block: {
          id: '123',
          image: {
            url: 'https://example.com/test.jpg',
            alt: 'A test image',
            height: 150,
            width: 150
          }
        }
      },
    });

    expect(fragment.querySelector('figcaption')).toBeNull();
  });

  test('renders responsive image with correct base64 background', async () => {
    const fragment = await renderToFragment<Props>(ImageBlock, {
      props: {
        block: {
          id: '123',
          image: {
            url: 'https://example.com/test.jpg',
            alt: 'A responsive test image',
            responsiveImage: {
              aspectRatio: 1.9526315789473685,
              base64: 'data:image/jpeg;base64,...'
            }
          }
        }
      },
    });

    const img = fragment.querySelector('img');
    expect(img?.style.aspectRatio).toBe('1.9526315789473685');
    expect(img?.style.backgroundImage).toContain('base64');
  });
});
