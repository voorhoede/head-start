import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import VideoEmbedBlock, { type Props } from './VideoEmbedBlock.astro';

describe('VideoEmbedBlock', () => {
  test('renders a YouTube embed block with the expected elements', async () => {
    const fragment = await renderToFragment<Props>(VideoEmbedBlock, {
      props: {
        block: {
          id: '123',
          video: {
            provider: 'youtube',
            providerUid: 'feylP4p1-KU',
            thumbnailUrl: 'https://i.ytimg.com/vi/feylP4p1-KU/hqdefault.jpg',
            title: 'Green Caravan pitch (NL)',
            url: 'https://www.youtube.com/watch?v=feylP4p1-KU',
            height: 113,
            width: 200
          },
          title: '',
          autoplay: false,
          mute: false,
          loop: false
        }
      }
    });

    expect(fragment.querySelector('[data-provider="youtube"]')).toBeTruthy();
    expect(fragment.querySelector('.play-button__icon')).toBeTruthy();
    expect(fragment.querySelector('.consent-alert')).toBeTruthy();
  });
});
