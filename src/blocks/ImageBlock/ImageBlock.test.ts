import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import ImageBlock, { type Props } from './ImageBlock.astro';

describe('ImageBlock', () => {
  
  test('renders ImageBlock', async () => {
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
    expect(img).toBeTruthy();
    expect(img?.src).toBe('https://example.com/test.jpg');
    expect(img?.alt).toBe('A test image');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });
});
