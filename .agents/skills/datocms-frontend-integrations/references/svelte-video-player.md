# Svelte Video Player — `<VideoPlayer />`

See `video-player-concepts.md` for the shared GraphQL query, video field definitions, and privacy defaults.

Svelte component for DatoCMS/Mux video streaming, designed to work with the `video` GraphQL query. Uses the [MUX Player web component](https://github.com/muxinc/elements/blob/main/packages/mux-player/README.md) internally.

## Installation

Requires `@mux/mux-player` as a peer dependency (the web component, not the React package):

```bash
npm install @datocms/svelte @mux/mux-player
```

## Basic Usage

```svelte
<script>
  import { VideoPlayer } from '@datocms/svelte';

  const { data } = $props();
</script>

<div>
  <h1>{data.blogPost.title}</h1>
  <VideoPlayer data={data.blogPost.cover.video} />
</div>
```

## Props

`<VideoPlayer />` accepts all [attributes of the `<mux-player />` web component](https://github.com/muxinc/elements/blob/main/packages/mux-player/REFERENCE.md) plus `data`:

| Prop | Type | Required | Description |
| - | - | - | - |
| `data` | `Video` object | Yes | Response from DatoCMS `video` GraphQL query |
| `paused` | boolean | No | Control to play or pause the video |

### Default Prop Differences from `<mux-player />`

| Prop | `<VideoPlayer />` Default | `<mux-player />` Default | Notes |
| - | - | - | - |
| `disableCookies` | `true` | `false` | Privacy-first by default |
| `disableTracking` | `true` | `false` | No analytics unless opted in |
| `preload` | `"metadata"` | varies | Optimal UX with saved bandwidth |
| `style.aspectRatio` | `"[width] / [height]"` | none | Auto-set from `data.width`/`data.height` when available |

All other props are forwarded to the internal `<mux-player />` web component.
