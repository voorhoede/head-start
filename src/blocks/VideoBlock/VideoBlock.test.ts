import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import VideoBlock, { type Props } from './VideoBlock.astro';

describe('VideoBlock', () => {
  test('renders a video block with a simple video', async () => {
    const fragment = await renderToFragment<Props>(VideoBlock, {
      props: {
        block: {
          id: '123',
          title: 'A test video',
          autoplay: false,
          mute: false,
          loop: false,
          videoAsset: {
            video: {
              muxAssetId: '123',
              muxPlaybackId: '123',
              streamingUrl: 'https://example.com/',
              thumbnailUrl: 'https://example.com/',
            }
          },
          tracks: []
        }
      }
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('video')).toBeTruthy();
  });

  test('renders a video block with subtitle tracks', async () => {
    const fragment = await renderToFragment<Props>(VideoBlock, {
      props: {
        block: {
          id: '123',
          title: 'A test video',
          autoplay: false,
          mute: false,
          loop: false,
          videoAsset: {
            video: {
              muxAssetId: '123',
              muxPlaybackId: '123',
              streamingUrl: 'https://example.com/',
              thumbnailUrl: 'https://example.com/',
            }
          },
          tracks: [{
            locale: 'en',
            kind: 'mp4',
            file: {
              url: 'https://example.com/'
            }
          }]
        }
      }
    });

    expect(fragment.querySelector('figure')).toBeTruthy();
    expect(fragment.querySelector('figcaption')).toBeTruthy();
    expect(fragment.querySelector('video')).toBeTruthy();
    expect(fragment.querySelector('track[srclang="en"]')).toBeTruthy();
  });
});
