import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import Image, { type Props } from './Image.astro';

const image = {
  url: 'https://example.com/test.jpg',
  alt: 'A test image',
  height: 150,
  width: 300,
};

describe('ImageBlock > Image', () => {
  test('renders the image with the correct source, alt text, and loading attribute', async () => {
    const fragment = await renderToFragment<Props>(Image, {
      props: { image },
    });

    const img = fragment.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.src).toBe('https://example.com/test.jpg');
    expect(img?.alt).toBe('A test image');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  test('renders the correct width and height', async () => {
    const fragment = await renderToFragment<Props>(Image, {
      props: { image },
    });

    const img = fragment.querySelector('img');
    expect(img?.width).toBe(300);
    expect(img?.height).toBe(150);
  });
  
  test('renders with overridden loading attribute', async () => {
    const fragment = await renderToFragment<Props>(Image, {
      props: { 
        image: {
          ...image,
        },
        loading: 'eager',
      },
    });

    const img = fragment.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
  });

  test('renders with a figcaption when title is provided', async () => {
    const fragment = await renderToFragment<Props>(Image, {
      props: { 
        image: {
          ...image,
          title: 'See the test image',
        } 
      } ,
    });

    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('figcaption')?.textContent).toBe('See the test image');
  });

  test('does not render figcaption when no title is provided', async () => {
    const fragment = await renderToFragment<Props>(Image, {
      props: { image },
    });

    expect(fragment.querySelector('figcaption')).toBeNull();
  });

  test('renders responsive image with correct base64 background', async () => {
    const fragment = await renderToFragment<Props>(Image, {
      props: { 
        image: {
          ...image,
          responsiveImage: {
            base64: 'data:image/jpeg;base64,/...',
          }
        },
      },
    });

    const img = fragment.querySelector('img');
    expect(img?.width).toBe(300);
    expect(img?.height).toBe(150);
    expect(img?.style.backgroundImage).toContain('base64');
  });
  
  test('renders figure with additional attributes passed through', async () => {
    const name = 'data-test-attribute';
    const attribute = { [name]: 'test-value' };
    const fragment = await renderToFragment<Props>(Image, {
      props: {
        ...attribute,
        image: {
          ...image,
          responsiveImage: {
            base64: 'data:image/jpeg;base64,/...',
          }
        },
      },
    });

    const figure = fragment.querySelector('figure');
    expect(figure?.getAttribute(name)).toBe(attribute[name]);
  });
});
