import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import EmbedBlock, { type Props as EmbedBlockProps } from './EmbedBlock.astro';



describe('EmbedBlock', () => {
  test('Twitter Embed is rendered', async () => {
    const fragment = await renderToFragment<EmbedBlockProps>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://twitter.com/devoorhoede/status/1670853955285565440',
          data: {
            provider_name: 'Twitter',
            url: 'https://twitter.com/devoorhoede/status/1670853955285565440',
            author_name: 'De Voorhoede',
            author_url: 'https://twitter.com/devoorhoede',
            html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">💡🤔 What if you could build a universal Design System with <a href="https://twitter.com/reactjs?ref_src=twsrc%5Etfw">@reactjs</a> and use it in any web application or framework? <br><br>👨‍💻 We achieved this by compiling React to Web Components. <br><br>✨ This is how: <a href="https://t.co/pxHTsj2IE8">https://t.co/pxHTsj2IE8</a> <a href="https://t.co/ZfzQtniidF">pic.twitter.com/ZfzQtniidF</a></p>&mdash; De Voorhoede (@devoorhoede) <a href="https://twitter.com/devoorhoede/status/1670853955285565440?ref_src=twsrc%5Etfw">June 19, 2023</a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>\n\n',
            width: 550,
            height: null,
            type: 'rich',
            cache_age: '3153600000',
            provider_url: 'https://twitter.com',
            version: '1.0'
          }
        }
      }
    });

    expect(fragment.querySelector('.twitter-tweet-rendered')).toBeDefined();
  });

  test('Flickr Embed is rendered', async () => {
    const fragment = await renderToFragment<EmbedBlockProps>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://www.flickr.com/photos/danielcheong/50416691972',
          data: {
            'provider_name': 'Flickr',
            'url': 'https://live.staticflickr.com/65535/50416691972_d17d04862f_b.jpg',
            'type': 'photo',
            'flickr_type': 'photo',
            'title': 'Fantasy Island',
            'author_name': 'DanielKHC',
            'author_url': 'https://www.flickr.com/photos/danielcheong/',
            'width': 1024,
            'height': 683,
            'web_page': 'https://www.flickr.com/photos/danielcheong/50416691972/',
            'thumbnail_url': 'https://live.staticflickr.com/65535/50416691972_d17d04862f_q.jpg',
            'thumbnail_width': 150,
            'thumbnail_height': 150,
            'web_page_short_url': 'https://flic.kr/p/2jP9J2S',
            'license': 'All Rights Reserved',
            'license_id': 0,
            'html': '<a data-flickr-embed="true" href="https://www.flickr.com/photos/danielcheong/50416691972/" title="Fantasy Island by DanielKHC, on Flickr"><img src="https://live.staticflickr.com/65535/50416691972_d17d04862f_b.jpg" width="1024" height="683" alt="Fantasy Island"></a><script async src="https://embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>',
            'version': 1,
            'cache_age': 3600,
            'provider_url': 'https://www.flickr.com/'
          }
        }
      }
    });

    expect(fragment.querySelector('.flickr-embed')).toBeDefined();
  });
  // Add more tests here
});
