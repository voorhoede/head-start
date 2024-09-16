import { renderToFragment } from '@lib/renderer';
import type { VideoEmbedBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import VideoEmbedBlock from './VideoEmbedBlock.astro';

const fragment = await renderToFragment<{ block: VideoEmbedBlockFragment }>(VideoEmbedBlock, {
  props: {
    block: {
      id: '123',
      autoplay: false,
      mute: false,
      loop: true,
      video: {
        provider: '',
        providerUid: '',
        thumbnailUrl: '',
        title: '',
        url: '',
        height: 0,
        width: 0
      }
    }
  }
});

describe('VideoEmbedBlock', () => {
  test('Component is rendered', () => {
    expect(fragment).toBeTruthy();
  });

  // Add more tests here
});
