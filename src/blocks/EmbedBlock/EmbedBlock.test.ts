import { renderToFragment } from '@lib/renderer';
import { describe, expect, test } from 'vitest';
import EmbedBlock, { type Props } from './EmbedBlock.astro';

describe('EmbedBlock', () => {
  test('renders a Twitter embed block correctly', async () => {
    const fragment = await renderToFragment<Props>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://twitter.com/devoorhoede/status/1670853955285565440',
          data: {
            provider_name: 'Twitter',
            url: 'https://twitter.com/devoorhoede/status/1670853955285565440',
            author_name: 'De Voorhoede',
            author_url: 'https://twitter.com/devoorhoede',
            html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">💡🤔 What if you could build a universal Design System with <a href="https://twitter.com/reactjs?ref_src=twsrc%5Etfw">@reactjs</a> and use it in any web application or framework? <br><br>👨‍💻 We achieved this by compiling React to Web Blocks. <br><br>✨ This is how: <a href="https://t.co/pxHTsj2IE8">https://t.co/pxHTsj2IE8</a> <a href="https://t.co/ZfzQtniidF">pic.twitter.com/ZfzQtniidF</a></p>&mdash; De Voorhoede (@devoorhoede) <a href="https://twitter.com/devoorhoede/status/1670853955285565440?ref_src=twsrc%5Etfw">June 19, 2023</a></blockquote>\n<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>\n\n',
            width: 550,
            height: null,
            type: 'rich',
            cache_age: '3153600000',
            provider_url: 'https://twitter.com',
            version: '1.0',
          },
        },
      },
    });

    expect(fragment.querySelector('default-embed')).toBeTruthy();
    expect(fragment.querySelector('[data-provider="Twitter"]')).toBeTruthy();
  });

  test('renders a Flickr embed block correctly', async () => {
    const fragment = await renderToFragment<Props>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://www.flickr.com/photos/danielcheong/50416691972',
          data: {
            provider_name: 'Flickr',
            url: 'https://live.staticflickr.com/65535/50416691972_d17d04862f_b.jpg',
            type: 'photo',
            flickr_type: 'photo',
            title: 'Fantasy Island',
            author_name: 'DanielKHC',
            author_url: 'https://www.flickr.com/photos/danielcheong/',
            width: 1024,
            height: 683,
            web_page: 'https://www.flickr.com/photos/danielcheong/50416691972/',
            thumbnail_url: 'https://live.staticflickr.com/65535/50416691972_d17d04862f_q.jpg',
            thumbnail_width: 150,
            thumbnail_height: 150,
            web_page_short_url: 'https://flic.kr/p/2jP9J2S',
            license: 'All Rights Reserved',
            license_id: 0,
            html: '<a data-flickr-embed="true" href="https://www.flickr.com/photos/danielcheong/50416691972/" title="Fantasy Island by DanielKHC, on Flickr"><img src="https://live.staticflickr.com/65535/50416691972_d17d04862f_b.jpg" width="1024" height="683" alt="Fantasy Island"></a><script async src="https://embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>',
            version: 1,
            cache_age: 3600,
            provider_url: 'https://www.flickr.com/',
          },
        },
      },
    });

    expect(fragment.querySelector('default-embed')).toBeTruthy();
    expect(fragment.querySelector('[data-provider="Flickr"]')).toBeTruthy();
  });

  test('renders a CodePen embed block correctly', async () => {
    const fragment = await renderToFragment<Props>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://codepen.io/mattdesl/pen/epQNqN',
          data: {
            provider_name: 'CodePen',
            url: 'https://codepen.io/mattdesl/pen/epQNqN',
            success: true,
            type: 'rich',
            version: '1.0',
            provider_url: 'https://codepen.io',
            title: 'Junk Pile - #codevember',
            author_name: 'Matt DesLauriers',
            author_url: 'https://codepen.io/mattdesl',
            height: '300',
            width: '800',
            thumbnail_width: '384',
            thumbnail_height: '225',
            thumbnail_url: 'https://shots.codepen.io/username/pen/epQNqN-512.jpg?version=1447132171',
            html: '<iframe id="cp_embed_epQNqN" src="https://codepen.io/mattdesl/embed/preview/epQNqN?default-tabs=js%2Cresult&amp;height=300&amp;host=https%3A%2F%2Fcodepen.io&amp;slug-hash=epQNqN" title="Junk Pile - #codevember" scrolling="no" frameborder="0" height="300" allowtransparency="true" class="cp_embed_iframe" style="width: 100%; overflow: hidden;"></iframe>'
          },
        },
      },
    });

    expect(fragment.querySelector('default-embed')).toBeTruthy();
    expect(fragment.querySelector('[data-provider="CodePen"]')).toBeTruthy();
  });

  test('renders a YouTube embed block correctly', async () => {
    const fragment = await renderToFragment<Props>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://www.youtube.com/watch?v=feylP4p1-KU&ab_channel=GreenCaravan',
          data: {
            provider_name: 'YouTube',
            url: 'https://www.youtube.com/watch?v=feylP4p1-KU&ab_channel=GreenCaravan',
            title: 'Green Caravan pitch (NL)',
            author_name: 'Green Caravan',
            author_url: 'https://www.youtube.com/@greencaravan6688',
            type: 'video',
            height: 113,
            width: 200,
            version: '1.0',
            provider_url: 'https://www.youtube.com/',
            thumbnail_height: 360,
            thumbnail_width: 480,
            thumbnail_url: 'https://i.ytimg.com/vi/feylP4p1-KU/hqdefault.jpg',
            html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/feylP4p1-KU?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="Green Caravan pitch (NL)"></iframe>'
          },
        },
      },
    });

    expect(fragment.querySelector('video-embed')).toBeTruthy();
    expect(fragment.querySelector('[data-provider="youtube"]')).toBeTruthy();
  });

  test('renders a Vimeo embed block correctly', async () => {
    const fragment = await renderToFragment<Props>(EmbedBlock, {
      props: {
        block: {
          id: '123',
          url: 'https://vimeo.com/641535920',
          data: {
            provider_name: 'Vimeo',
            url: 'https://vimeo.com/641535920',
            type: 'video',
            version: '1.0',
            provider_url: 'https://vimeo.com/',
            title: 'Structured text with inline records in DatoCMS',
            author_name: 'De Voorhoede',
            author_url: 'https://vimeo.com/voorhoede',
            is_plus: '0',
            account_type: 'pro',
            html: '<iframe src="https://player.vimeo.com/video/641535920?app_id=122963" width="372" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" title="Structured text with inline records in DatoCMS"></iframe>',
            width: 372,
            height: 360,
            duration: 35,
            description: 'Companion article: https://www.voorhoede.nl/en/blog/enriching-rich-text-with-inline-components-datocms-react/',
            thumbnail_url: 'https://i.vimeocdn.com/video/1290514162-5999b7e95c88cad3fe8cfcff2a3e1bd3a6e6cf4fe322cb95a_295x166',
            thumbnail_width: 295,
            thumbnail_height: 286,
            thumbnail_url_with_play_button: 'https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F1290514162-5999b7e95c88cad3fe8cfcff2a3e1bd3a6e6cf4fe322cb95a_295x166&src1=http%3A%2F%2Ff.vimeocdn.com%2Fp%2Fimages%2Fcrawler_play.png',
            upload_date: '2021-11-02 10:17:54',
            video_id: 641535920,
            uri: '/videos/641535920'
          },
        },
      },
    });

    expect(fragment.querySelector('video-embed')).toBeTruthy();
    expect(fragment.querySelector('[data-provider="vimeo"]')).toBeTruthy();
  });
});
