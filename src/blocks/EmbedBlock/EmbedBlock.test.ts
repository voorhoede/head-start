import { renderToFragment } from '@lib/renderer';
import type { EmbedBlockFragment } from '@lib/types/datocms';
import { describe, expect, test } from 'vitest';
import EmbedBlock from './EmbedBlock.astro';



describe('EmbedBlock', () => {
  test('Component renders Twitter Embed', async () => {
    const fragment = await renderToFragment<{ block: EmbedBlockFragment }>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://twitter.com/devoorhoede/status/1670853955285565440',
          data: {
            'provider_name': 'Twitter',
            'url': 'https://twitter.com/devoorhoede/status/1670853955285565440',
            'author_name': 'De Voorhoede',
            'author_url': 'https://twitter.com/devoorhoede',
            'html': '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">💡🤔 What if you could build a universal Design System with <a href="https://twitter.com/reactjs?ref_src=twsrc%5Etfw">@reactjs</a> and use it in any web application or framework? <br><br>👨‍💻 We achieved this by compiling React to Web Components. <br><br>✨ This is how: <a href="https://t.co/pxHTsj2IE8">https://t.co/pxHTsj2IE8</a> <a href="https://t.co/ZfzQtniidF">pic.twitter.com/ZfzQtniidF</a></p>&mdash; De Voorhoede (@devoorhoede) <a href="https://twitter.com/devoorhoede/status/1670853955285565440?ref_src=twsrc%5Etfw">June 19, 2023</a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>\n\n',
            'width': 550,
            'height': null,
            'type': 'rich',
            'cache_age': '3153600000',
            'provider_url': 'https://twitter.com',
            'version': '1.0'
          }
        }
      }
    });

    expect(fragment.querySelector('.twitter-tweet-rendered')).toBeDefined();
  });

  // Add more tests here
});
