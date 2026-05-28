# React Video Player — `<VideoPlayer />`

See `video-player-concepts.md` for the shared GraphQL query, video field definitions, and privacy defaults.

React component for DatoCMS/Mux video streaming, designed to work with the `video` GraphQL query.

## Installation

Requires `@mux/mux-player-react` as a peer dependency:

```bash
npm install react-datocms @mux/mux-player-react
```

## Basic Usage

```jsx
import { VideoPlayer } from 'react-datocms';

function BlogPost({ data }) {
  return (
    <div>
      <h1>{data.blogPost.title}</h1>
      <VideoPlayer data={data.blogPost.cover.video} />
    </div>
  );
}
```

## Props

`<VideoPlayer />` accepts all [MuxPlayer props](https://github.com/muxinc/elements/blob/main/packages/mux-player-react/REFERENCE.md) plus `data`:

| Prop | Type | Required | Description |
| - | - | - | - |
| `data` | `Video` object | Yes | Response from DatoCMS `video` GraphQL query |

### Default Prop Differences from `<MuxPlayer />`

| Prop | `<VideoPlayer />` Default | `<MuxPlayer />` Default | Notes |
| - | - | - | - |
| `disableCookies` | `true` | `false` | Privacy-first by default |
| `disableTracking` | `true` | `false` | No analytics unless opted in |
| `preload` | `"metadata"` | varies | Optimal UX with saved bandwidth |
| `style.aspectRatio` | `"[width] / [height]"` | none | Auto-set from `data.width`/`data.height` when available |

All other props are forwarded directly to `<MuxPlayer />`.

## `useVideoPlayer` Hook

For custom player wrappers, use `useVideoPlayer` to transform DatoCMS video data into `<MuxPlayer />` props:

```jsx
import { useVideoPlayer } from 'react-datocms';
import MuxPlayer from '@mux/mux-player-react';

function CustomPlayer({ videoData }) {
  const props = useVideoPlayer({ data: videoData });

  // props = {
  //   playbackId: 'ip028MAXF026dU900bKiyNDttjonw7A1dFY',
  //   title: 'Title',
  //   style: { aspectRatio: '1080 / 1920' },
  //   placeholder: 'data:image/bmp;base64,...',
  // }

  return <MuxPlayer {...props} />;
}
```
