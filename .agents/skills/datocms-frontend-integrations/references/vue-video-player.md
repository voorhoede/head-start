# Vue Video Player — `<VideoPlayer>`

See `video-player-concepts.md` for the shared GraphQL query, video field definitions, and privacy defaults.

Vue 3 component for DatoCMS/Mux video streaming, designed to work with the `video` GraphQL query. Wraps the `<mux-player>` [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).

## Installation

Requires `@mux/mux-player` as a peer dependency (note: **not** `@mux/mux-player-react`):

```bash
npm install vue-datocms @mux/mux-player
```

## Setup

Register globally:

```js
import { DatocmsVideoPlayerPlugin } from 'vue-datocms';

app.use(DatocmsVideoPlayerPlugin);
```

Or use locally:

```vue
<script setup>
import { VideoPlayer } from 'vue-datocms';
</script>
```

## Basic Usage

```vue
<script setup>
import { VideoPlayer } from 'vue-datocms';

const props = defineProps<{ data: any }>();
</script>

<template>
  <div>
    <h1>{{ data.blogPost.title }}</h1>
    <VideoPlayer :data="data.blogPost.cover.video" />
  </div>
</template>
```

## Props

`<VideoPlayer>` accepts all [`<mux-player>` attributes](https://github.com/muxinc/elements/blob/main/packages/mux-player/REFERENCE.md) plus `data`:

| Prop | Type | Required | Description |
| - | - | - | - |
| `data` | `Video` object | Yes | Response from DatoCMS `video` GraphQL query |

### Default Prop Differences from `<mux-player>`

| Prop | `<VideoPlayer>` Default | `<mux-player>` Default | Notes |
| - | - | - | - |
| `disable-cookies` | `true` | `false` | Privacy-first by default |
| `preload` | `"metadata"` | varies | Optimal UX with saved bandwidth |
| `style.aspectRatio` | `"[width] / [height]"` | none | Auto-set from `data.width`/`data.height` when available |

All other props are forwarded directly to `<mux-player>`.
