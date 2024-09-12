import { renderToFragment } from '@lib/renderer';
import type { VideoBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import VideoBlock from './VideoBlock.astro';

const fragment = await renderToFragment<{ block: VideoBlockFragment }>(VideoBlock, {
  props: {
    block: {
      id: '123',
      autoplay: false,
      mute: false,
      loop: true,
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

describe('VideoBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeDefined();
  });

  // Add more tests here
});
