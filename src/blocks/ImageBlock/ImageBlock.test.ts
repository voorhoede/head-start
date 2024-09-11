import { renderToFragment } from '@lib/renderer';
import type { ImageBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import ImageBlock from './ImageBlock.astro';

const fragment = await renderToFragment<{ block: ImageBlockFragment }>(ImageBlock, {
  props: {
    block: {
      id: '123',
      image: {
        url: 'https://example.com/',
        alt: 'A test image',
        title: 'A test image',
      }
    }
  },
});

describe('ImageBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  test('Has all required elements', () => {
    expect(fragment.querySelector('figure')).toBeDefined();
    expect(fragment.querySelector('figcaption')).toBeDefined();
    expect(fragment.querySelector('img')).toBeDefined();
  });

  test('Has all required props', () => {
    const imgElement = fragment.querySelector('img')!;
    expect(imgElement.src).toBe('https://example.com/');
    expect(imgElement.alt).toBe('A test image');
    expect(imgElement.height).not.toBeNull();
    expect(imgElement.width).not.toBeNull();
  });
});
