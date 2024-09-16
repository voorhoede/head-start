import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import ImageBlock, { type Props as ImageBlockProps } from './ImageBlock.astro';



describe('ImageBlock', () => {
  test('Component renders image', async () => {
    const fragment = await renderToFragment<ImageBlockProps>(ImageBlock, {
      props: {
        block: {
          id: '123',
          image: {
            url: 'https://example.com/',
            alt: 'A test image',
            title: 'A test image',
            height: 150,
            width: 150
          }
        }
      },
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('figcaption')?.textContent).toBe('A test image');
    expect(fragment.querySelector('img')).toBeTruthy();
    expect(fragment.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    expect(fragment.querySelector('img')?.src).toBe('https://example.com/');
    expect(fragment.querySelector('img')?.alt).toBe('A test image');
    expect(fragment.querySelector('img')?.style.aspectRatio).toBe('150/150');
  });

  test('Component renders responsive image', async () => {
    const fragment = await renderToFragment<ImageBlockProps>(ImageBlock, {
      props: {
        block: {
          id: '123',
          image: {
            url: 'https://example.com/',
            alt: 'A test image',
            title: 'A test image',
            height: 150,
            width: 150,
            responsiveImage: {
              aspectRatio: 1.9526315789473685,
              base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLFQoWDRMVDhYWDhEPFg0VFxMeGBYVFhUoKy0jGh0oHRUWJDUlKC0vMjIyGSI4PTcwPCsxMi8BCgsLDg0OHBAQHDsoIhw7Ly8vLzs7OzsvLy81Ly8vLzUvNS87OzUvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL//AABEIAA0AGAMBIgACEQEDEQH/xAAZAAABBQAAAAAAAAAAAAAAAAADAAIEBQf/xAAeEAABBAIDAQAAAAAAAAAAAAAEAAECAxIxESFBIv/EABQBAQAAAAAAAAAAAAAAAAAAAAP/xAAXEQEAAwAAAAAAAAAAAAAAAAACAAER/9oADAMBAAIRAxEAPwDWCCRY7k3KBEsTLaaWBVl6orgVM/TunIORiDkt6rhpN8yZJAECrx57SRWTVwbJ2f/Z'
            }
          }
        }
      },
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('figcaption')?.textContent).toBe('A test image');
    expect(fragment.querySelector('img')).toBeTruthy();
    expect(fragment.querySelector('img')?.style.aspectRatio).toBe('1.9526315789473685');
    expect(fragment.querySelector('img')?.style.backgroundImage).toContain('base64');
  });
});
